import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Если маршрут не защищён — просто пропускаем
  if (!isStudentRoute(req) && !isTeacherRoute(req)) {
    return NextResponse.next();
  }

  // Если пользователь не авторизован — редирект на login (или Unauthorized)
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
    // Или так:
    // return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const user = await clerkClient.users.getUser(userId);
  const userRole = (user.publicMetadata?.userType as "student" | "teacher") || "student";

  console.log("Middleware — userId:", userId, "userRole:", userRole);

  if (isStudentRoute(req) && userRole !== "student") {
    return NextResponse.redirect(new URL("/teacher/courses", req.url));
  }

  if (isTeacherRoute(req) && userRole !== "teacher") {
    return NextResponse.redirect(new URL("/user/courses", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};


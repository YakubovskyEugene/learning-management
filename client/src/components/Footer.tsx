import React from "react";

const footerLinks = [
  { label: "О нас", href: "https://elearningindustry.com/about-us" },
  { label: "Политика конфиденциальности", href: "https://elearningindustry.com/legal/privacy-policy" },
  { label: "Лицензирование", href: "https://elearningindustry.com/directory/software-categories/learning-management-systems/license/free" },
  { label: "Контакты", href: "https://elearningindustry.com/contact-us" },
];

const Footer = () => {
  return (
    <div className="footer">
      <p>&copy; 2025 MyLMS. Все права защищены.</p>
      <div className="footer__links">
        {footerLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="footer__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Footer;

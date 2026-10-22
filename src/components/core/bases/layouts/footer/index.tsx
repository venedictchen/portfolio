export const Footer = () => {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-8 text-sm text-cream-muted md:pl-(--page-left) md:pr-(--page-right)">
        <p>© {new Date().getFullYear()} Venedict Chen</p>
        <p>Jakarta, Indonesia</p>
      </div>
    </footer>
  );
};

export default Footer;

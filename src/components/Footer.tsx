export const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 px-4 py-6 mt-auto">
      <div className="container mx-auto text-center text-sm text-gray-600">
        <p>&copy; {new Date().getFullYear()} Bike Route Proposals. All rights reserved.</p>
      </div>
    </footer>
  );
};
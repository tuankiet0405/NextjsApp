import SideNavigation from "../_components/SideNavigation";

export default function Layout({ children }) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-[16rem_1fr] h-full gap-4 md:gap-12">
      <div>
        <SideNavigation />
      </div>
      <div className="py-1">{children}</div>
    </div>
  );
}


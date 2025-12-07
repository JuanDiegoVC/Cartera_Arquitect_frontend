import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { FloatingHelpButton } from "./FloatingHelpButton";

export function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
            <div className="max-w-full">{children}</div>
          </main>
        </div>
        {/* Botón flotante de ayuda global */}
        <FloatingHelpButton />
      </div>
    </SidebarProvider>
  );
}

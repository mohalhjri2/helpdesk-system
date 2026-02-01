import AppShell from "./layout/AppShell";
import TicketListPage from "./pages/TicketListPage";

export default function App() {
  return (
    <AppShell title="Help Desk System">
      <TicketListPage />
    </AppShell>
  );
}
import { emailEnabled, recentEmails } from '../../../../server/email';
import { getSettings } from '../../../../server/settings';
import { SettingsAdmin } from '../../../../views/admin/SettingsAdmin';

export default async function Page() {
  return <SettingsAdmin settings={await getSettings()} emailOn={emailEnabled()} emailLog={await recentEmails().catch(() => [])} />;
}

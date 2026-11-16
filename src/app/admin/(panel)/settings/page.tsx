import { getSettings } from '../../../../server/settings';
import { SettingsAdmin } from '../../../../views/admin/SettingsAdmin';

export default async function Page() {
  return <SettingsAdmin settings={await getSettings()} />;
}

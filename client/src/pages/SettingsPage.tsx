import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSettings, updateSettings } from "../api/settings";
import type { NotificationSettings } from "../api/settings";

export const SettingsPage = () => {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = async (partial: Partial<NotificationSettings>) => {
    if (!settings) return;

    const updatedLocal = { ...settings, ...partial };
    setSettings(updatedLocal); // optymistyczna aktualizacja UI

    setIsSaving(true);
    setSavedMessage("");
    try {
      const saved = await updateSettings(partial);
      setSettings(saved);
      setSavedMessage("Zapisano");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch {
      setSavedMessage("Błąd zapisu");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <p className="text-text-muted font-mono text-sm">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-1">
              Panel subskrypcji
            </p>
            <h1 className="font-display text-3xl font-bold">Ustawienia</h1>
          </div>
          <Link
            to="/"
            className="font-mono text-xs text-text-muted hover:text-accent transition"
          >
            ← Powrót
          </Link>
        </div>

        <div className="relative ticket-notch bg-surface border border-border rounded-lg p-6">
          <div className="ticket-accent-line top-3" />
          <div className="ticket-accent-line bottom-3" />

          <div className="py-2 flex flex-col gap-6">

            <div className="flex justify-between items-center">
              <p className="font-display font-bold text-lg">Powiadomienia email</p>
              {savedMessage && (
                <span className="font-mono text-xs text-accent">{savedMessage}</span>
              )}
            </div>

            {/* Główny przełącznik */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm">Przypomnienia o płatnościach</p>
                <p className="font-mono text-[11px] text-text-muted mt-0.5">
                  Dostaniesz maila przed zbliżającą się płatnością
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailRemindersEnabled}
                onChange={(e) => handleChange({ emailRemindersEnabled: e.target.checked })}
                className="w-5 h-5 accent-accent cursor-pointer"
              />
            </label>

            {/* Ile dni wcześniej */}
            <div className={settings.emailRemindersEnabled ? "" : "opacity-40 pointer-events-none"}>
              <p className="text-sm mb-2">Wysyłaj przypomnienie</p>
              <div className="flex gap-2">
                {[1, 3, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => handleChange({ reminderDaysBefore: days })}
                    className={`font-mono text-xs px-3 py-2 rounded border transition ${
                      settings.reminderDaysBefore === days
                        ? "bg-accent text-bg border-accent"
                        : "border-border text-text-muted hover:border-accent"
                    }`}
                  >
                    {days} {days === 1 ? "dzień" : "dni"} wcześniej
                  </button>
                ))}
              </div>
            </div>

            {/* Tylko aktywne */}
            <label className={`flex items-center justify-between cursor-pointer ${settings.emailRemindersEnabled ? "" : "opacity-40 pointer-events-none"}`}>
              <div>
                <p className="text-sm">Tylko aktywne subskrypcje</p>
                <p className="font-mono text-[11px] text-text-muted mt-0.5">
                  Pomiń wstrzymane subskrypcje w przypomnieniach
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.remindOnlyActive}
                onChange={(e) => handleChange({ remindOnlyActive: e.target.checked })}
                className="w-5 h-5 accent-accent cursor-pointer"
              />
            </label>

            <div className="border-t border-border" />

            {/* Cotygodniowe podsumowanie */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm">Cotygodniowe podsumowanie</p>
                <p className="font-mono text-[11px] text-text-muted mt-0.5">
                  Mail w każdy poniedziałek z listą wszystkich subskrypcji
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyDigestEnabled}
                onChange={(e) => handleChange({ weeklyDigestEnabled: e.target.checked })}
                className="w-5 h-5 accent-accent cursor-pointer"
              />
            </label>

          </div>
        </div>
      </div>
    </div>
  );
};
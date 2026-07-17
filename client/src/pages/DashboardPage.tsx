import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../api/subscriptions";
import type { Subscription } from "../api/subscriptions";
import { TemplatePicker } from "../components/TemplatePicker";
import type { SubscriptionTemplate } from "../data/subscriptionTemplates";
import { Pencil, Trash2, Pause, Play } from "lucide-react";

type SortOption = "name" | "price" | "nextBillingAt" | "category";
type PeriodOption = "weekly" | "monthly" | "yearly";


const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

export const DashboardPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("nextBillingAt");

  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [nextBillingAt, setNextBillingAt] = useState(today);
  const [category, setCategory] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(["active", "inactive"]));
  const [selectedCategories, setSelectedCategories] = useState<Set<string> | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [totalPeriod, setTotalPeriod] = useState<PeriodOption>("monthly");

  const { logout } = useAuth();

  const loadSubscriptions = async () => {
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch {
      setError("Nie udało się pobrać subskrypcji");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const resetForm = () => {
    setName("");
    setPrice("");
    setNextBillingAt(today);
    setCategory("");
    setFormErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Nazwa jest wymagana";
    else if (name.trim().length > 50) errors.name = "Nazwa może mieć maks. 50 znaków";

    const parsedPrice = parseFloat(price);
    if (!price) errors.price = "Cena jest wymagana";
    else if (isNaN(parsedPrice) || parsedPrice <= 0) errors.price = "Cena musi być liczbą większą od 0";
    else if (parsedPrice > 100000) errors.price = "Podaj realistyczną cenę";

    if (!nextBillingAt) errors.nextBillingAt = "Data jest wymagana";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSelectTemplate = (template: SubscriptionTemplate) => {
    setName(template.name);
    setPrice(template.price.toString());
    setBillingCycle(template.billingCycle);
    setCategory(template.category);
    setFormErrors({});
  };

  const handleStartEdit = (sub: Subscription) => {
    setEditingId(sub.id);
    setName(sub.name);
    setPrice(sub.price.toString());
    setBillingCycle(sub.billingCycle);
    setNextBillingAt(sub.nextBillingAt.split("T")[0]);
    setCategory(sub.category || "");
    setFormErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    const payload = {
      name: name.trim(),
      price: parseFloat(price),
      billingCycle,
      nextBillingAt,
      category: category || undefined,
    };

    try {
      if (editingId) {
        await updateSubscription(editingId, payload);
      } else {
        await createSubscription(payload);
      }
      resetForm();
      loadSubscriptions();
    } catch {
      setError(editingId ? "Nie udało się zaktualizować subskrypcji" : "Nie udało się dodać subskrypcji");
    }
  };

  const handleToggleActive = async (sub: Subscription) => {
    try {
      await updateSubscription(sub.id, {
        name: sub.name,
        price: parseFloat(sub.price),
        billingCycle: sub.billingCycle,
        nextBillingAt: sub.nextBillingAt,
        category: sub.category || undefined,
        isActive: !sub.isActive,
      });
      loadSubscriptions();
    } catch {
      setError("Nie udało się zmienić statusu subskrypcji");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription(id);
      loadSubscriptions();
    } catch {
      setError("Nie udało się usunąć subskrypcji");
    }
  };

  const getMonthlyPrice = (sub: Subscription) => {
    const p = parseFloat(sub.price);
    if (sub.billingCycle === "yearly") return p / 12;
    if (sub.billingCycle === "weekly") return p * 4.33;
    return p;
  };

  const monthlyTotal = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + getMonthlyPrice(s), 0);

  const displayedTotal =
    totalPeriod === "weekly"
      ? monthlyTotal / 4.33
      : totalPeriod === "yearly"
        ? monthlyTotal * 12
        : monthlyTotal;

  const allCategories = Array.from(
    new Set(subscriptions.map((s) => s.category || "Bez kategorii"))
  ).sort();

  const effectiveCategories = selectedCategories ?? new Set(allCategories);

  const toggleStatus = (status: string) => {
    const next = new Set(statusFilter);
    if (next.has(status)) next.delete(status);
    else next.add(status);
    setStatusFilter(next);
  };

  const toggleCategory = (cat: string) => {
    const next = new Set(effectiveCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelectedCategories(next);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const statusOk = statusFilter.has(sub.isActive ? "active" : "inactive");
    const categoryOk = effectiveCategories.has(sub.category || "Bez kategorii");
    return statusOk && categoryOk;
  });

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    let result = 0;
    switch (sortBy) {
      case "name": result = a.name.localeCompare(b.name); break;
      case "price": result = getMonthlyPrice(b) - getMonthlyPrice(a); break;
      case "nextBillingAt": result = new Date(a.nextBillingAt).getTime() - new Date(b.nextBillingAt).getTime(); break;
      case "category": result = (a.category || "").localeCompare(b.category || ""); break;
    }

    return result !== 0 ? result : a.name.localeCompare(b.name);
  });

  const categoryTotals = subscriptions
    .filter((s) => s.isActive)
    .reduce<Record<string, number>>((acc, sub) => {
      const cat = sub.category || "Bez kategorii";
      acc[cat] = (acc[cat] || 0) + getMonthlyPrice(sub);
      return acc;
    }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryValue = Math.max(...sortedCategories.map(([, v]) => v), 1);

  const upcomingPayment = subscriptions
    .filter((s) => s.isActive)
    .sort((a, b) => new Date(a.nextBillingAt).getTime() - new Date(b.nextBillingAt).getTime())[0];

  const daysUntil = (isoString: string) => {
    // Wyciągamy samą datę (YYYY-MM-DD), ignorując czas i strefę UTC z backendu
    const [year, month, day] = isoString.split("T")[0].split("-").map(Number);
    const target = new Date(year, month - 1, day); // lokalna północ

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diff = target.getTime() - today.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header - pełna szerokość */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="font-mono text-xs text-accent tracking-widest uppercase mb-1">Panel subskrypcji</p>
            <h1 className="font-display text-3xl font-bold">Twoje subskrypcje</h1>
          </div>
          <button
            onClick={logout}
            className="font-mono text-xs text-text-muted hover:text-danger transition"
          >
            Wyloguj →
          </button>
        </div>

        {/* Dwie kolumny */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-18">

          {/* LEWA KOLUMNA - lista */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => (showForm ? resetForm() : setShowForm(true))}
                className="font-mono text-sm bg-accent text-bg font-medium px-4 py-2 rounded hover:bg-accent-dim transition"
              >
                {showForm ? "× Anuluj" : "+ Nowa subskrypcja"}
              </button>

              {subscriptions.length > 0 && (
                <div className="flex gap-2 relative">
                  <button
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                    className="font-mono text-xs bg-surface border border-border rounded px-3 py-2 text-text-muted hover:border-accent transition"
                  >
                    Filtry {showFilterPanel ? "▴" : "▾"}
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="font-mono text-xs bg-surface border border-border rounded px-3 py-2 text-text-muted focus:outline-none focus:border-accent"
                  >
                    <option value="nextBillingAt">Najbliższa płatność</option>
                    <option value="price">Cena malejąco</option>
                    <option value="name">Nazwa A-Z</option>
                    <option value="category">Kategoria</option>
                  </select>

                  {showFilterPanel && (
                    <div className="absolute top-full mt-2 left-0 z-30 w-72 bg-surface border border-border rounded-lg p-4 shadow-xl">

                      {/* Status */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Status</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setStatusFilter(new Set(["active", "inactive"]))}
                              className="font-mono text-[10px] text-accent hover:underline"
                            >
                              wszystkie
                            </button>
                            <button
                              onClick={() => setStatusFilter(new Set())}
                              className="font-mono text-[10px] text-text-muted hover:underline"
                            >
                              brak
                            </button>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={statusFilter.has("active")}
                            onChange={() => toggleStatus("active")}
                            className="accent-accent"
                          />
                          Aktywne
                        </label>
                        <label className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={statusFilter.has("inactive")}
                            onChange={() => toggleStatus("inactive")}
                            className="accent-accent"
                          />
                          Wstrzymane
                        </label>
                      </div>

                      {/* Kategorie */}
                      {allCategories.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">Kategoria</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedCategories(new Set(allCategories))}
                                className="font-mono text-[10px] text-accent hover:underline"
                              >
                                wszystkie
                              </button>
                              <button
                                onClick={() => setSelectedCategories(new Set())}
                                className="font-mono text-[10px] text-text-muted hover:underline"
                              >
                                brak
                              </button>
                            </div>
                          </div>
                          <div className="max-h-40 overflow-y-auto">
                            {allCategories.map((cat) => (
                              <label key={cat} className="flex items-center gap-2 py-1 cursor-pointer text-sm">
                                <input
                                  type="checkbox"
                                  checked={effectiveCategories.has(cat)}
                                  onChange={() => toggleCategory(cat)}
                                  className="accent-accent"
                                />
                                {cat}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="bg-surface border border-border rounded-lg p-5 mb-6 flex flex-col gap-4"
              >
                <h2 className="font-display font-bold text-lg">
                  {editingId ? "Edytuj subskrypcję" : "Nowa subskrypcja"}
                </h2>

                <TemplatePicker onSelect={handleSelectTemplate} />

                <div>
                  <input
                    placeholder="Nazwa (np. Netflix)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-bg border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent ${formErrors.name ? "border-danger" : "border-border"}`}
                  />
                  {formErrors.name && <p className="text-danger text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Cena"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`w-full bg-bg border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent ${formErrors.price ? "border-danger" : "border-border"}`}
                    />
                    {formErrors.price && <p className="text-danger text-xs mt-1">{formErrors.price}</p>}
                  </div>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="bg-bg border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  >
                    <option value="weekly">Tygodniowo</option>
                    <option value="monthly">Miesięcznie</option>
                    <option value="yearly">Rocznie</option>
                  </select>
                </div>

                <div>
                  <input
                    type="date"
                    value={nextBillingAt}
                    onChange={(e) => setNextBillingAt(e.target.value)}
                    className={`w-full bg-bg border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent ${formErrors.nextBillingAt ? "border-danger" : "border-border"}`}
                  />
                  {formErrors.nextBillingAt && <p className="text-danger text-xs mt-1">{formErrors.nextBillingAt}</p>}
                </div>

                <div>
                  <input
                    list="category-suggestions"
                    placeholder="Kategoria (np. Streaming, Gaming)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                  <datalist id="category-suggestions">
                    <option value="Streaming" />
                    <option value="Muzyka" />
                    <option value="Gaming" />
                    <option value="AI / Narzędzia" />
                    <option value="Chmura" />
                    <option value="Fitness" />
                    <option value="Edukacja" />
                  </datalist>
                </div>

                <button
                  type="submit"
                  className="bg-accent text-bg font-mono text-sm font-medium rounded px-4 py-2 hover:bg-accent-dim transition"
                >
                  {editingId ? "Zapisz zmiany" : "Dodaj subskrypcję"}
                </button>
              </form>
            )}

            {error && <p className="text-danger text-sm mb-4">{error}</p>}

            {isLoading ? (
              <p className="text-text-muted font-mono text-sm">Ładowanie...</p>
            ) : sortedSubscriptions.length === 0 ? (
              <p className="text-text-muted font-mono text-sm">
                {subscriptions.length === 0 ? "Brak subskrypcji. Dodaj pierwszą powyżej." : "Brak subskrypcji spełniających te filtry."}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {sortedSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`relative ticket-notch bg-surface border border-border rounded-lg flex transition-opacity ${!sub.isActive ? "opacity-50" : ""}`}
                  >
                    <div className="ticket-accent-line top-3" />
                    <div className="ticket-accent-line bottom-3" />

                    <div className="flex-1 p-7 flex flex-col items-center justify-center text-center">
                      <p className="font-display font-bold">{sub.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {sub.category && (
                          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                            {sub.category}
                          </p>
                        )}
                        {!sub.isActive && (
                          <p className="font-mono text-[10px] text-amber-500 uppercase tracking-wider">
                            • Wstrzymana
                          </p>
                        )}
                      </div>
                      <p className="font-mono text-xs text-text-muted mt-2">
                        Płatność: {formatDate(sub.nextBillingAt)}
                      </p>
                    </div>

                    <div className="ticket-divider flex flex-col items-center justify-center text-center py-6 px-4 w-[170px] shrink-0">                      <p className="font-mono text-lg text-accent font-medium">
                      {parseFloat(sub.price).toFixed(2)} <span className="text-xs text-text-muted">{sub.currency}</span>
                    </p>
                      <p className="font-mono text-s text-accent font-medium">
                        <span className="text-xs text-text-muted">/{sub.billingCycle}</span>
                      </p>
                    </div>

                    <div className="absolute inset-y-0 right-0 z-10 w-12">
                      <button
                        onClick={() => handleStartEdit(sub)}
                        className="group/edit absolute -right-4 top-3 h-1/3 w-4 hover:w-13 hover:-right-13 bg-blue-500 rounded-r-md transition-all duration-200 flex items-center justify-end pr-3 overflow-hidden z-20"
                        aria-label="Edytuj subskrypcję"
                      >
                        <Pencil size={14} className="text-white shrink-0 opacity-0 group-hover/edit:opacity-100 transition-opacity duration-150 delay-75" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(sub)}
                        className={`group/toggle absolute -right-4 top-1/3 h-1/3 w-4 hover:w-13 hover:-right-13 rounded-r-md transition-all duration-200 flex items-center justify-end pr-3 overflow-hidden z-20 ${sub.isActive ? "bg-amber-500" : "bg-emerald-500"}`}
                        aria-label={sub.isActive ? "Wstrzymaj subskrypcję" : "Wznów subskrypcję"}
                      >
                        {sub.isActive ? (
                          <Pause size={14} className="text-white shrink-0 opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-150 delay-75" />
                        ) : (
                          <Play size={14} className="text-white shrink-0 opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-150 delay-75" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="group/delete absolute -right-4 bottom-3 h-1/3 w-4 hover:w-13 hover:-right-13 bg-danger rounded-r-md transition-all duration-200 flex items-center justify-end pr-3 overflow-hidden z-20"
                        aria-label="Usuń subskrypcję"
                      >
                        <Trash2 size={14} className="text-white shrink-0 opacity-0 group-hover/delete:opacity-100 transition-opacity duration-150 delay-75" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PRAWA KOLUMNA - sidebar */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-10 lg:self-start">

            <div className="bg-surface border border-border rounded-lg p-5">
              <div className="flex justify-between items-center mb-2">
                <p className="font-mono text-xs text-text-muted uppercase tracking-wider">Rachunek</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTotalPeriod("weekly")}
                    className={`font-mono text-[10px] px-2 py-1 rounded transition ${totalPeriod === "weekly" ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                      }`}
                  >
                    TYDZ
                  </button>
                  <button
                    onClick={() => setTotalPeriod("monthly")}
                    className={`font-mono text-[10px] px-2 py-1 rounded transition ${totalPeriod === "monthly" ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                      }`}
                  >
                    MIES
                  </button>
                  <button
                    onClick={() => setTotalPeriod("yearly")}
                    className={`font-mono text-[10px] px-2 py-1 rounded transition ${totalPeriod === "yearly" ? "bg-accent text-bg" : "text-text-muted hover:text-text"
                      }`}
                  >
                    ROK
                  </button>
                </div>
              </div>
              <p className="font-mono text-3xl font-medium text-accent">
                {displayedTotal.toFixed(2)} <span className="text-sm text-text-muted">PLN</span>
              </p>
            </div>

            {sortedCategories.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-5">
                <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-3">Wg kategorii</p>
                <div className="flex flex-col gap-2.5">
                  {sortedCategories.map(([cat, value]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text">{cat}</span>
                        <span className="font-mono text-text-muted">{value.toFixed(0)} PLN</span>
                      </div>
                      <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(value / maxCategoryValue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingPayment && (
              <div className="bg-surface border border-border rounded-lg p-5">
                <p className="font-mono text-xs text-text-muted uppercase tracking-wider mb-2">Najbliższa płatność</p>
                <p className="font-display font-bold">{upcomingPayment.name}</p>
                <p className="font-mono text-sm text-accent mt-1">
                  {daysUntil(upcomingPayment.nextBillingAt) === 0
                    ? "dziś"
                    : daysUntil(upcomingPayment.nextBillingAt) === 1
                      ? "jutro"
                      : `za ${daysUntil(upcomingPayment.nextBillingAt)} dni`}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
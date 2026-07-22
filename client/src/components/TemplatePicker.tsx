import type { SubscriptionTemplate } from "../data/subscriptionTemplates";
import { subscriptionTemplates } from "../data/subscriptionTemplates";
import { BrandIcon } from "./BrandIcon";

interface Props {
  onSelect: (template: SubscriptionTemplate) => void;
}

export const TemplatePicker = ({ onSelect }: Props) => {
  return (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-600 mb-2">
        Wybierz z popularnych usług lub dodaj własną poniżej
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {subscriptionTemplates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="flex items-center gap-2 border rounded-lg px-3 py-2 text-left hover:bg-zinc-700 transition"
          >
            <BrandIcon
              slug={template.iconSlug}
              size={30}
              localIcon={template.localIcon}
              fallbackLabel={template.name}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{template.name}</p>
              <p className="text-xs text-gray-500">
                {template.price} {template.currency}/
                {template.billingCycle === "monthly" ? "mies." : "rok"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
import * as simpleIcons from "simple-icons";

interface Props {
  slug: string;
  size?: number;
}

export const BrandIcon = ({ slug, size = 20, fallbackLabel }: Props & { fallbackLabel?: string }) => {
  const icon = (simpleIcons as any)[slug];

  if (!icon) {
    return (
      <div
        style={{ width: size, height: size, fontSize: size * 0.5 }}
        className="bg-gray-700 text-white rounded flex items-center justify-center font-bold shrink-0"
      >
        {fallbackLabel?.charAt(0).toUpperCase() ?? "?"}
      </div>
    );
  }

  return (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={`#${icon.hex}`}>
      <path d={icon.path} />
    </svg>
  );
};
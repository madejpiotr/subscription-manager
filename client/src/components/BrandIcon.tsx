import * as simpleIcons from "simple-icons";

const localIcons = import.meta.glob("../assets/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const getLocalIconUrl = (filename: string) => {
  const match = Object.entries(localIcons).find(([path]) => path.endsWith(filename));
  return match?.[1];
};

interface Props {
  slug: string;
  size?: number;
  localIcon?: string;
  fallbackLabel?: string;
}

export const BrandIcon = ({ slug, size = 40, localIcon, fallbackLabel }: Props) => {
  const icon = (simpleIcons as any)[slug];

  if (icon) {
    return (
      <svg role="img" viewBox="0 0 25 25" width={size} height={size} fill={`#${icon.hex}`}>
        <path d={icon.path} />
      </svg>
    );
  }

  if (localIcon) {
    const url = getLocalIconUrl(localIcon);
    if (url) {
      return (
        <img
          src={url}
          alt=""
          width={size}
          height={size}
          style={{ objectFit: "contain" }}
          className="rounded-md"
        />
      );
    }
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      className="bg-gray-700 text-white rounded flex items-center justify-center font-bold shrink-0"
    >
      {fallbackLabel?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
};
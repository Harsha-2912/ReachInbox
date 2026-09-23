import { getInitials } from '@/lib/format';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-[13px]',
  lg: 'w-12 h-12 text-[15px]',
};

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }
  return (
    <div className={`flex items-center justify-center rounded-full bg-ink-100 text-ink-700 font-semibold ${sizes[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
}

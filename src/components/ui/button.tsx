import type { ComponentPropsWithoutRef } from 'react';

type Variant = 'primary' | 'secondary';
type ButtonStyle = { variant?: Variant };
type ButtonProps = ComponentPropsWithoutRef<'button'> & ButtonStyle;
type ButtonLinkProps = ComponentPropsWithoutRef<'a'> &
  ButtonStyle & { href: string };

function buttonStyles(variant: Variant, className?: string) {
  return ['button', `button--${variant}`, className].filter(Boolean).join(' ');
}

export function Button({
  variant = 'primary',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles(variant, className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = 'primary',
  className,
  ...props
}: ButtonLinkProps) {
  return <a className={buttonStyles(variant, className)} {...props} />;
}

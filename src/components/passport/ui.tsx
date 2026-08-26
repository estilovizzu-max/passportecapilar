import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, ChevronLeft, Menu, Home, Users, BookMarked, User } from "lucide-react";
import type { ReactNode } from "react";
import emblema from "@/assets/emblema.png";

export function Emblema({ className = "h-10" }: { className?: string }) {
  return (
    <img
      src={emblema}
      alt="Emblema Passaporte Capilar"
      className={`${className} w-auto object-contain`}
      loading="lazy"
    />
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-gold ${className}`}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/60 to-gold/60" />
      <span className="text-[10px] tracking-[0.3em]">◈</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/60 to-gold/60" />
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      <span className="text-gold">≈</span>
      <h2 className="font-display text-sm tracking-[0.22em] text-ink">{children}</h2>
      <span className="text-gold">≈</span>
    </div>
  );
}

export function RoundIconButton({
  icon,
  onClick,
  to,
  label,
}: {
  icon: ReactNode;
  onClick?: () => void;
  to?: string;
  label: string;
}) {
  const cls =
    "grid h-11 w-11 place-items-center rounded-full wine-surface text-primary-foreground ring-1 ring-gold/40 transition-transform active:scale-95";
  if (to) {
    return (
      <Link to={to} aria-label={label} className={cls}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {icon}
    </button>
  );
}

export function AppHeader({ back, backTo = "/inicio" }: { back?: boolean; backTo?: string }) {
  return (
    <header className="px-5 pt-5">
      <div className="flex items-start justify-between">
        {back ? (
          <RoundIconButton to={backTo} label="Voltar" icon={<ChevronLeft className="h-5 w-5" />} />
        ) : (
          <RoundIconButton to="/perfil" label="Menu" icon={<Menu className="h-5 w-5" />} />
        )}
        <Emblema className="h-9" />
        <RoundIconButton
          to="/comunicacao"
          label="Notificações"
          icon={<Bell className="h-5 w-5" />}
        />
      </div>
      <h1 className="mt-1 text-center font-display text-2xl tracking-[0.06em] gold-text">
        PASSAPORTE CAPILAR<sup className="text-[0.5em]">TM</sup>
      </h1>
      <Ornament className="mt-2" />
    </header>
  );
}

export function WineButton({
  children,
  onClick,
  to,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  type?: "button" | "submit";
}) {
  const cls =
    "flex w-full items-center justify-center gap-3 rounded-full wine-surface px-6 py-4 font-display text-base tracking-[0.14em] text-primary-foreground ring-1 ring-gold/50 transition-transform active:scale-[0.98]";
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function OutlineButton({
  children,
  to,
  onClick,
}: {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
}) {
  const cls =
    "flex w-full items-center justify-center gap-3 rounded-full border border-gold/70 bg-card px-6 py-3.5 font-display text-base tracking-[0.1em] text-primary transition-colors active:bg-secondary";
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Stamp({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-24 w-24 rotate-[-8deg] place-items-center rounded-full border-2 border-primary/50 text-center font-display text-[10px] leading-tight tracking-[0.18em] text-primary/60">
      {children}
    </div>
  );
}

const navItems = [
  { to: "/inicio", label: "INÍCIO", icon: Home },
  { to: "/clientes", label: "CLIENTES", icon: Users },
  { to: "/passaporte", label: "PASSAPORTE", icon: BookMarked },
  { to: "/perfil", label: "PERFIL", icon: User },
];

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-20 mt-8 border-t border-gold/30 bg-background/95 px-3 pb-3 pt-2 backdrop-blur">
      <ul className="flex items-stretch">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = path === to || path.startsWith(`${to}/`);
          return (
            <li key={to} className="flex-1">
              <Link to={to} className="flex flex-col items-center gap-1 py-1">
                <span
                  className={
                    active
                      ? "grid h-10 w-10 place-items-center rounded-full wine-surface text-primary-foreground"
                      : "grid h-10 w-10 place-items-center text-gold"
                  }
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={`font-display text-[10px] tracking-[0.14em] ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Screen({
  children,
  nav = true,
  back,
  backTo,
  header = true,
}: {
  children: ReactNode;
  nav?: boolean;
  back?: boolean;
  backTo?: string;
  header?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      {header && <AppHeader back={back} backTo={backTo} />}
      <main className="flex-1 px-5 pb-6 pt-4">{children}</main>
      {nav && <BottomNav />}
    </div>
  );
}

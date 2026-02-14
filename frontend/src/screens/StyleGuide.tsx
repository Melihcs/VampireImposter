import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { PlayerChip } from "../components/PlayerChip";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Timer } from "../components/Timer";
import { RoleCard } from "../components/RoleCard";
import { BottomSheet } from "../components/BottomSheet";
import { useState } from "react";
import { Moon, Skull, Sun } from "lucide-react";

export default function StyleGuide() {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <div className="min-h-screen max-w-[390px] mx-auto">
      <AppHeader roomCode="GUIDE" isConnected={true} />

      <div className="p-6 space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Style Guide</h1>
          <p className="text-sm text-muted-foreground">
            Imposter Room Design System
          </p>
        </div>

        {/* Colors */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Colors
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-16 bg-accent rounded-lg border border-accent" />
              <p className="text-sm font-medium">Accent Teal</p>
              <p className="text-xs text-muted-foreground">#5BDEEA</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-destructive rounded-lg border border-destructive" />
              <p className="text-sm font-medium">Destructive</p>
              <p className="text-xs text-muted-foreground">#C85D5D</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-card rounded-lg border border-border" />
              <p className="text-sm font-medium">Card</p>
              <p className="text-xs text-muted-foreground">#151923</p>
            </div>
            <div className="space-y-2">
              <div className="h-16 bg-muted rounded-lg border border-border" />
              <p className="text-sm font-medium">Muted</p>
              <p className="text-xs text-muted-foreground">#2A3040</p>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Typography
          </h2>
          <div className="space-y-4 p-6 bg-card border border-border rounded-2xl">
            <div>
              <h1 className="text-3xl font-bold">Heading 1</h1>
              <p className="text-xs text-muted-foreground">32px, Bold</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Heading 2</h2>
              <p className="text-xs text-muted-foreground">24px, Bold</p>
            </div>
            <div>
              <p className="text-base font-medium">Body Medium</p>
              <p className="text-xs text-muted-foreground">16px, Medium</p>
            </div>
            <div>
              <p className="text-sm">Body Small</p>
              <p className="text-xs text-muted-foreground">14px, Regular</p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{ fontVariant: "small-caps" }}
              >
                Small Caps
              </p>
              <p className="text-xs text-muted-foreground">12px, Small Caps</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Buttons
          </h2>
          <div className="space-y-3">
            <Button variant="primary" fullWidth>
              Primary Button
            </Button>
            <Button variant="secondary" fullWidth>
              Secondary Button
            </Button>
            <Button variant="destructive" fullWidth>
              Destructive Button
            </Button>
            <Button variant="primary" fullWidth disabled>
              Disabled Button
            </Button>
          </div>
        </section>

        {/* Player Chips */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Player Chips
          </h2>
          <div className="space-y-3">
            <PlayerChip name="Melih" isGM={true} />
            <PlayerChip name="Deniz" isReady={true} />
            <PlayerChip name="Eddie" isDead={true} />
            <PlayerChip name="Ollie" variant="voting" />
          </div>
        </section>

        {/* Phase Indicators */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Phase Indicators
          </h2>
          <div className="space-y-3">
            <PhaseIndicator phase="lobby" />
            <PhaseIndicator phase="reveal" />
            <PhaseIndicator phase="day" />
            <PhaseIndicator phase="vote" />
            <PhaseIndicator phase="execute" />
            <PhaseIndicator phase="night" />
          </div>
        </section>

        {/* Timer */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Timer
          </h2>
          <Timer seconds={45} totalSeconds={60} label="Time remaining" />
        </section>

        {/* Role Cards */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Role Cards (Anti-Peeking)
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            All role cards are visually identical except for the role name and
            instruction text. Privacy blur is the same for all roles.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <div className="mb-2 text-center">
                <RoleCard
                  role="villager"
                  isRevealed={true}
                  privacyMode={false}
                />
              </div>
              <p className="text-xs text-muted-foreground">Villager</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2 text-center">
                <RoleCard
                  role="vampire"
                  isRevealed={true}
                  privacyMode={false}
                />
              </div>
              <p className="text-xs text-muted-foreground">Vampire</p>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Cards & Containers
          </h2>
          <div className="space-y-4">
            <div className="p-6 bg-card border border-border rounded-2xl">
              <h3 className="font-bold mb-2">Standard Card</h3>
              <p className="text-sm text-muted-foreground">
                16px border-radius, subtle border, inner shadow
              </p>
            </div>

            <div className="p-4 bg-muted/30 border border-accent/20 rounded-xl">
              <p className="text-xs text-muted-foreground">
                Info card with accent border
              </p>
            </div>

            <div className="p-4 bg-card border-2 border-accent/30 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-accent" />
                <p className="font-bold text-accent">Highlighted Card</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Stronger accent border for important info
              </p>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Icons
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: Moon, label: "Moon" },
              { icon: Sun, label: "Sun" },
              { icon: Skull, label: "Skull" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Sheet */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Bottom Sheet
          </h2>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowSheet(true)}
          >
            Show Bottom Sheet
          </Button>
        </section>

        {/* Spacing */}
        <section>
          <h2
            className="text-xl font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Spacing System (4pt)
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-accent" />
              <span className="text-sm">4px (1 unit)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-4 bg-accent" />
              <span className="text-sm">8px (2 units)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-4 bg-accent" />
              <span className="text-sm">12px (3 units)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-4 bg-accent" />
              <span className="text-sm">16px (4 units)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-4 bg-accent" />
              <span className="text-sm">24px (6 units)</span>
            </div>
          </div>
        </section>
      </div>

      <BottomSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        title="Example Bottom Sheet"
      >
        <p className="text-muted-foreground mb-6">
          This is an example of a bottom sheet modal with smooth animations.
        </p>
        <Button variant="primary" fullWidth onClick={() => setShowSheet(false)}>
          Close
        </Button>
      </BottomSheet>
    </div>
  );
}

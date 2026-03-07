import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  templateUrl: './splash-page.component.html',
  styles: `
    .splash-page {
      width: 100%;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 1.5rem;
      box-sizing: border-box;
    }

    .splash-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .orb-wrapper {
      position: relative;
      width: 6rem;
      height: 6rem;
      margin-bottom: 2rem;
      animation: float 3s ease-in-out infinite;
    }

    .orb {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      border-radius: 999px;
      border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
      background: color-mix(in srgb, var(--color-accent) 12%, transparent);
      box-shadow: 0 0 38px rgba(91, 222, 234, 0.35);
    }

    .orb-glow {
      position: absolute;
      inset: -0.35rem;
      border-radius: 999px;
      z-index: 1;
      background: color-mix(in srgb, var(--color-accent) 30%, transparent);
      filter: blur(14px);
      opacity: 0.7;
      animation: pulse 2s ease-in-out infinite;
    }

    .title {
      margin: 0;
      font-size: 2rem;
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -0.015em;
    }

    .subtitle {
      margin: 0.55rem 0 2.1rem;
      color: var(--color-muted-foreground);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    .loading {
      margin: 0;
      color: var(--color-muted-foreground);
      animation: breathing 2s ease-in-out infinite;
      font-size: 0.9rem;
    }

    @keyframes float {
      0%,
      100% {
        transform: translateY(0) rotate(0deg);
      }
      35% {
        transform: translateY(-4px) rotate(4deg);
      }
      65% {
        transform: translateY(-2px) rotate(-4deg);
      }
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(0.95);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.12);
        opacity: 0.85;
      }
    }

    @keyframes breathing {
      0%,
      100% {
        opacity: 0.45;
      }
      50% {
        opacity: 1;
      }
    }
  `
})
export class SplashPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private timeoutId?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timeoutId = setTimeout(() => {
      this.router.navigateByUrl('/enter-name');
    }, 2500);
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

//bora-app/src/types/pwa.d.ts

// 1. Define a interface para o evento especial
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

// 2. A CORREÇÃO CRÍTICA: Estende a interface 'Window' global
// Isso diz ao TypeScript: "A interface 'Window' que você já conhece
// agora TAMBÉM pode ter um evento chamado 'beforeinstallprompt'".
declare global {
    interface WindowEventMap {
        beforeinstallprompt: BeforeInstallPromptEvent;
    }
}
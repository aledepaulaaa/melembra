// melembra/src/lib/botResponses.ts
export const dateRequestResponses = [
    "Muito bem! E qual a data para o lembrete '{title}'?",
    "Ótimo, então você quer criar o lembrete '{title}', certo? Qual a data que quer definir para ele?",
    "Entendido. Para quando devo agendar '{title}'?",
    "Perfeito. Agora, me diga a data para '{title}'.",
]

export function getRandomDateResponse(title: string): string {
    const randomIndex = Math.floor(Math.random() * dateRequestResponses.length)
    return dateRequestResponses[randomIndex].replace('{title}', title)
}
//bora-app/src/utils/sugestoesMock.ts
export const sugestoesMock = [
    "Comprar pão",
    "Pagar contas",
    "Ligar para a vovó",
    "Reunião às 10h",
    "Ir na academia",
    "Pegar roupa na lavanderia",
    "Comprar presentes",
    "Estudar para prova",
    "Lembrar do aniversário",
    "Regar as plantas",
    "Visitar o médico",
    "Responder e-mails",
    "Fazer a declaração de imposto de renda",
    "Levar o pet ao veterinário",
    "Organizar a geladeira",
    "Fazer a mala de viagem",
    "Lazer: Assistir série nova",
]

export const getMockSuggestions = (prompt: string): string[] => {
    if (!prompt || prompt.length < 3) return []

    const lowerCasePrompt = prompt.toLowerCase()

    const filteredSuggestions = sugestoesMock.filter(sugestao =>
        sugestao.toLowerCase().includes(lowerCasePrompt)
    )

    // Retorna um subconjunto de sugestões para simular a API.
    return filteredSuggestions.slice(0, 5)
}
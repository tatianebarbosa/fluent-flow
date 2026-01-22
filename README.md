# Fluent Flow

Eu criei o **Fluent Flow** como um app simples para estudar com repetição, foco e ritmo. A ideia principal é não depender de uma tela cheia de informações o tempo todo: o app mostra uma palavra, frase, placa ou pergunta por vez e ajuda a manter o treino fluindo.

O projeto junta duas partes que eu queria praticar:

- treino de inglês com áudio, repetição e categorias;
- estudo para a prova teórica da CNH, com placas, perguntas, simulados e revisão.

## O que o site faz

Na tela inicial eu deixei três caminhos principais:

- **Iniciar Flow**: começa o treino de inglês direto no modo de repetição;
- **Estudar CNH**: abre a área completa de estudo para a prova teórica;
- **Ajustes**: permite personalizar o treino antes de começar.

O visual foi pensado para funcionar bem no celular, com uma interface escura, botões grandes e poucas distrações.

## Treino de inglês

O modo Flow é a parte do app voltada para praticar inglês por repetição. Eu escolho uma categoria, o nível, o tempo de treino e o intervalo entre cada item. Depois disso, o app entra em um fluxo automático.

Durante o treino, o app:

- mostra uma palavra ou frase em inglês;
- pode exibir a tradução em português;
- fala o item em voz alta usando síntese de voz do navegador;
- avança sozinho no intervalo configurado;
- permite pausar, continuar, repetir o áudio e finalizar antes do tempo;
- faz uma contagem de preparação antes de começar;
- pode ter tempo de descanso entre ciclos.

As categorias de inglês incluídas são:

- números;
- cores;
- animais;
- comida;
- casa;
- roupas;
- corpo;
- verbos;
- compras;
- restaurante;
- viagem;
- trabalho;
- emoções;
- fitness;
- frases.

Também criei um modo de aprendizado que pode repetir uma palavra ou repetir blocos de palavras antes de avançar. Isso ajuda quando eu quero fixar melhor uma sequência em vez de só passar rapidamente pelos itens.

## Ajustes do Flow

Na tela de ajustes eu consigo configurar o treino do jeito que prefiro:

- categoria;
- nível básico, intermediário ou avançado;
- nível 1, 2 ou 3 dentro da dificuldade;
- duração do treino;
- intervalo entre palavras;
- tempo de descanso;
- voz feminina ou masculina;
- mostrar ou esconder tradução;
- ativar ou desativar modo aprendizado;
- mostrar ou esconder o tempo.

Os ajustes ficam salvos no navegador, então o próximo treino já começa com as minhas preferências.

## Estudo para CNH

A área de CNH foi feita para estudar de forma mais prática, separando o conteúdo em abas. Ela tem:

- **Flow**: mistura placas e perguntas em um treino automático;
- **Simulado**: permite responder questões em modo aprender ou modo prova;
- **Cards**: funciona como flashcards para revisar perguntas;
- **Placas**: mostra placas de regulamentação, advertência e indicação;
- **Erradas**: guarda questões e itens que precisam de revisão;
- **Progresso**: mostra acertos, placas estudadas e pontos fracos;
- **Plano**: traz uma rotina simples de estudo.

No modo aprender, quando eu respondo uma questão, o app mostra a resposta correta, uma explicação simples, o motivo das alternativas erradas e um macete para lembrar. No modo prova, o resultado aparece no final, como um simulado.

Também dá para marcar perguntas para revisar depois, refazer as erradas, filtrar placas, buscar por nome/código/significado e favoritar as placas mais difíceis.

## PWA

Eu também configurei o app como PWA. Ele tem manifesto, ícones e service worker, então pode ser instalado no celular ou no computador como se fosse um aplicativo.

## Tecnologias usadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Web Speech API
- Local Storage
- PWA com manifest e service worker

## Como rodar o projeto

Depois de baixar o projeto, instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Depois abra no navegador:

```text
http://localhost:3000
```

Para gerar a versão de produção:

```bash
npm run build
```

## Scripts disponíveis

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Observação

Esse projeto foi feito como uma ferramenta pessoal de estudo. A proposta é ser direto, leve e fácil de usar, principalmente no celular, para treinar um pouco por dia sem precisar montar uma rotina complicada.

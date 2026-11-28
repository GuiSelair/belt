# Cinto de utilidades na marca da home

## Objetivo

Adicionar um cinto de utilidades à marca “Belt” exibida no hero da home. O
elemento deve sugerir que a tipografia está sendo apertada, sem comprometer a
leitura do nome do aplicativo.

## Escopo

- Aplicar o cinto somente ao título grande da home.
- Manter a marca pequena do cabeçalho inalterada.
- Preservar os elementos decorativos existentes no hero.
- Não adicionar imagens rasterizadas ou novas dependências.

## Direção visual

O cinto passa pelo terço inferior da palavra e acompanha uma curva suave,
criando a sensação de abraço e tensão escolhida na opção visual B. A faixa
mantém a espessura integral da proposta original, sem redução, enquanto todas
as letras permanecem reconhecíveis.

A composição usa grafite na faixa e nos pequenos bolsos, verde-limão na fivela
e detalhes coerentes com os acentos atuais da marca. As formas podem remeter a
um cinto de utilidades de quadrinhos, mas devem ser originais, geométricas,
amigáveis e sem símbolos ou insígnias de personagens.

## Arquitetura

Criar um componente `UtilityBelt` responsável apenas pelo SVG decorativo. O
componente será posicionado sobre o texto “Belt” dentro do `HomeHero`, com
dimensões responsivas e sem participar da árvore de acessibilidade.

O título continuará sendo texto real no único `h1` da página. O SVG usará
`aria-hidden="true"` e não receberá foco, eventos ou conteúdo necessário para
compreender a página.

## Responsividade

O cinto ocupará a largura da palavra e manterá as mesmas proporções em telas
compactas e amplas. Seu posicionamento deve manter a fivela centralizada e
evitar que os bolsos ultrapassem os limites visuais do título.

## Testes e critérios de aceite

- A home continua apresentando exatamente um título de nível 1 com o texto
  “Belt”.
- O cinto aparece somente no hero da home.
- O SVG é decorativo e oculto de tecnologias assistivas.
- A marca permanece legível nos breakpoints base e médio.
- Os links e a chamada principal do hero mantêm o comportamento atual.

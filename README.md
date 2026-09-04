# Aliado Food — Loja Online

Site de encomendas da **Aliado Food** — refeições, pizzas e bebidas, com carrinho, checkout (levantamento ou entrega), cálculo automático de taxa de entrega por município, envio do pedido via WhatsApp, secções de Parceiros e Actividades, formulário "Trabalhe Connosco" e rodapé com o programa **Aliado+**.

100% front-end (HTML, CSS e JavaScript puro) — não precisa de build, servidor ou base de dados para funcionar. Pronto para o GitHub Pages.

---

## 1. Estrutura do projecto

```
aliado-food-webapp/
├── index.html          → página principal (loja)
├── admin.html           → painel interno da equipa (pedidos + estafetas)
├── css/
│   ├── style.css         → estilo geral do site
│   └── admin.css         → estilo do painel interno
├── js/
│   ├── data.js            → cardápio, municípios/taxas, parceiros, actividades
│   ├── app.js              → lógica da loja (carrinho, checkout, WhatsApp)
│   └── admin.js             → lógica do painel interno
├── assets/
│   └── logo.png              → logótipo oficial
└── .github/workflows/deploy.yml → publicação automática no GitHub Pages
```

---

## 2. Como publicar no GitHub (passo a passo)

1. Cria um repositório novo no GitHub (ex: `aliado-food-webapp`).
2. Carrega todos os ficheiros desta pasta para o repositório (podes arrastar os ficheiros na interface do GitHub, ou usar `git`):
   ```bash
   git init
   git add .
   git commit -m "Loja online Aliado Food"
   git branch -M main
   git remote add origin https://github.com/SEU-UTILIZADOR/aliado-food-webapp.git
   git push -u origin main
   ```
3. No repositório, vai a **Settings → Pages**.
4. Em "Build and deployment", escolhe **Source: GitHub Actions**. O workflow em `.github/workflows/deploy.yml` já está incluído e vai publicar o site automaticamente a cada `push` para `main`.
5. Ao fim de 1–2 minutos, o site fica disponível em `https://SEU-UTILIZADOR.github.io/aliado-food-webapp/`.

> Se preferires, podes também usar a opção clássica **Source: Deploy from a branch → main → / (root)** em vez do workflow — funciona igualmente, sem necessidade de Actions.

### Domínio próprio
Em **Settings → Pages → Custom domain**, podes apontar um domínio como `www.aliadofood.co.ao` (é necessário configurar o DNS do domínio a apontar para o GitHub Pages).

---

## 3. Como editar o conteúdo do dia-a-dia

Tudo o que precisa de ser actualizado com frequência está no ficheiro **`js/data.js`**:

- **Cardápio** (`ALIADO_MENU`): adiciona, remove ou edita pratos, pizzas e bebidas — nome, descrição, preço em Kz e uma etiqueta opcional (`tag: "Novo"`, `"Mais pedido"`, etc.).
- **Municípios e taxas de entrega** (`ALIADO_MUNICIPIOS` e `ALIADO_CONFIG`): ver secção 4 abaixo.
- **Parceiros** (`ALIADO_PARCEIROS`): nome, descrição e iniciais (usadas como marca circular). Para usar logótipos reais, coloca as imagens em `assets/parceiros/` e troca o bloco `partner-card__mark` em `js/app.js` por uma tag `<img>`.
- **Actividades/Eventos** (`ALIADO_ACTIVIDADES`): título, data e descrição.

Não precisas de mexer em mais nenhum ficheiro para estas actualizações.

---

## 4. Como funciona o cálculo da taxa de entrega

O modelo segue a lógica de tarifação por quilómetro usada pelas aplicações de motorizadas em Angola (a exemplo da Yango): uma tarifa base que cobre os primeiros quilómetros, mais um valor por cada km adicional.

```js
// em js/data.js
const ALIADO_CONFIG = {
  taxaBaseKz: 560,         // tarifa base (cobre os primeiros "kmIncluidos")
  kmIncluidos: 5,
  precoPorKmExtraKz: 160,   // por cada km extra
  arredondarParaKz: 50,      // arredondamento do valor final
};

const ALIADO_MUNICIPIOS = [
  { id: "luanda", nome: "Luanda (centralidades)", distanciaKm: 6 },
  // ...
];
```

Quando o cliente selecciona o município no checkout, a taxa é calculada automaticamente: `taxa = taxaBaseKz + max(0, distanciaKm - kmIncluidos) × precoPorKmExtraKz`, arredondada ao múltiplo de 50 Kz mais próximo.

**Importante:** as distâncias (`distanciaKm`) na tabela são estimativas de referência a partir do ponto de venda da Aliado Food, para que o site funcione desde já. Recomenda-se calibrar estes valores periodicamente com base em cotações reais do aplicativo Yango (ou de outro operador de motorizadas), já que estas plataformas não disponibilizam uma API pública para consulta automática de tarifas por terceiros. Basta ajustar o número de km de cada município no ficheiro `js/data.js` — o cálculo actualiza-se sozinho.

Para um município marcado como `sobConsulta: true` (ex: Quiçama, pela distância), o site mostra "Sob consulta via WhatsApp" em vez de um valor fixo.

Bairro e rua são campos de preenchimento opcional (como pedido) e servem apenas para detalhar a morada — não entram no cálculo da taxa, que se baseia exclusivamente no município.

---

## 5. Fluxo de encomenda

1. O cliente adiciona itens ao carrinho (guardado no navegador do próprio cliente).
2. No checkout, escolhe entre **Levantar na loja** ou **Entrega ao domicílio**.
3. Se for entrega, escolhe o Município (obrigatório) — a taxa aparece de imediato — e pode indicar Bairro/Rua (opcional).
4. Preenche nome e telefone (email e observações são opcionais).
5. Revê o resumo e confirma — é gerada uma **referência única** (ex: `AF-20260904-1234`) para acompanhamento.
6. O cliente pode enviar o resumo do pedido directamente para o WhatsApp oficial da Aliado Food (+244 929 809 889), já com referência, itens, morada e total preenchidos — é o canal mais rápido para a equipa receber e confirmar o pedido.

---

## 6. Painel interno (`admin.html`)

Pensado para a equipa acompanhar pedidos e atribuir estafetas às entregas.

- **Acesso**: protegido por uma palavra-passe simples (`aliado2026`, definida no topo de `js/admin.js` — muda-a antes de publicar). Esta é uma protecção de conveniência do lado do navegador, não uma autenticação segura — ver limitação abaixo.
- **Estafetas**: adiciona nome, telefone (WhatsApp) e zona habitual de cada estafeta, e marca-o como Disponível/Ocupado.
- **Atribuir entrega**: em cada pedido de entrega, o botão "Atribuir estafeta" mostra os estafetas disponíveis; ao escolher um, o pedido fica marcado como "Atribuído" e abre automaticamente uma conversa de WhatsApp com o estafeta, já com a referência, morada, itens e total prontos a enviar.

### ⚠️ Limitação importante a conhecer
Este site é 100% estático (sem servidor nem base de dados), por isso o painel `admin.html` só consegue ler os pedidos que foram guardados **no mesmo navegador/dispositivo** onde foram feitos. Ou seja, tal como está, o painel é útil para testar o fluxo e para um único ponto de atendimento, mas **não sincroniza automaticamente pedidos feitos nos telemóveis dos clientes** para o painel da equipa.

O canal que já funciona de imediato, para qualquer cliente e sem depender de sincronização, é o botão **"Enviar pedido via WhatsApp"** no final da compra — é ele que deve ser tratado como a via oficial de recepção de pedidos enquanto não houver uma base de dados partilhada.

**Para teres um painel em tempo real com pedidos de todos os clientes**, o próximo passo natural é ligar este site a um backend simples, por exemplo o **Supabase** (que já usas noutros projectos Aliado Food): trocar a gravação em `localStorage` (em `js/app.js` e `js/admin.js`) por chamadas à base de dados Supabase, e activar autenticação real para o painel. Se quiseres, posso preparar essa integração a seguir.

---

## 7. Formulário "Trabalhe Connosco"

Usa o serviço gratuito [FormSubmit](https://formsubmit.co/) para enviar as candidaturas directamente para **aliadofood@hotmail.com**, sem precisar de servidor próprio.

**Activação necessária (uma única vez):** da primeira vez que alguém submeter o formulário depois do site publicado, o FormSubmit envia um email de confirmação para `aliadofood@hotmail.com` a pedir para activar aquele endereço. Basta clicar no link de confirmação; a partir daí, todos os envios seguintes chegam directamente à caixa de entrada.

Se preferires manter o utilizador na própria página (sem redireccionar para o site do FormSubmit) depois de enviar, o próprio FormSubmit disponibiliza um modo AJAX — consulta a documentação em formsubmit.co para o activar substituindo o `action` do formulário em `index.html`.

---

## 8. Contactos oficiais usados no site

| Canal | Valor |
|---|---|
| Telemóvel / WhatsApp | +244 929 809 889 |
| Email | aliadofood@hotmail.com |
| Instagram | [@aliadofood](https://instagram.com/aliadofood) |
| Facebook | [@aliadofood.ao](https://facebook.com/aliadofood.ao) |
| Programa de fidelidade | [Aliado+](https://aliadomais.lovable.app) |

Para alterar qualquer um destes dados, edita `ALIADO_CONFIG` em `js/data.js` e os links correspondentes em `index.html`.

---

## 9. Identidade visual

- Vermelho principal: `#C8230F`
- Laranja: `#E07820`
- Creme (fundo): `#FDF5EC`
- Tipografia de destaque: **Baloo 2** (arredondada, alinhada ao logótipo)
- Tipografia de texto: **Manrope**

---

## 10. Compatibilidade e acessibilidade

- Totalmente responsivo (telemóvel, tablet, desktop).
- Navegação por teclado e estados de foco visíveis.
- Respeita a preferência do sistema por "reduzir movimento".
- Testado sem dependência de frameworks externos — apenas Google Fonts é carregado por CDN.

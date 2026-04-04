import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import PublicHeader from '../../components/public/PublicHeader';

const plans = [
  {
    name: 'FREE',
    price: 'Grátis',
    subtitle: 'Para começar rápido e validar a operação.',
    items: ['Até 20 produtos ativos', '1 usuário', 'Estoque e dashboard básico'],
    cta: 'Começar grátis',
  },
  {
    name: 'PRO',
    price: 'R$ 29,99/mês',
    subtitle: 'Para quem quer controle real, visibilidade e rotina sem planilha.',
    items: ['Até 500 produtos ativos', 'Financeiro e relatórios', 'KPIs e saúde do estoque'],
    cta: 'Assinar PRO',
    featured: true,
  },
  {
    name: 'BUSINESS',
    price: 'R$ 79,99/mês',
    subtitle: 'Para equipes, papéis diferentes e operação mais séria.',
    items: ['Produtos ilimitados', 'Equipe e permissões', 'Tudo do PRO liberado'],
    cta: 'Assinar BUSINESS',
  },
] as const;

const stats = [
  { label: 'Tempo gasto em planilhas', value: '-60%' },
  { label: 'Visão de estoque e giro', value: '24/7' },
  { label: 'Plano pago mais acessível', value: 'R$ 29,99' },
];

const steps = [
  {
    title: 'Cadastre sua operação',
    text: 'Crie a conta, escolha a empresa e organize seus produtos, categorias e estoque inicial em poucos minutos.',
  },
  {
    title: 'Acompanhe tudo em um painel',
    text: 'Veja produtos, movimentações, financeiro, indicadores e saúde do estoque sem ficar pulando entre ferramentas.',
  },
  {
    title: 'Suba de plano quando fizer sentido',
    text: 'Comece no FREE, ganhe profundidade no PRO e escale com equipe e permissões no BUSINESS.',
  },
] as const;

const testimonials = [
  {
    name: 'Mariana Costa',
    role: 'Loja de utilidades',
    quote:
      'A gente saiu de planilha espalhada para um painel que realmente mostra o que entrou, saiu e onde o dinheiro está vazando.',
  },
  {
    name: 'Lucas Andrade',
    role: 'Operação de revenda',
    quote:
      'O que mais pesou foi ter estoque, financeiro e relatórios no mesmo lugar. O PRO já se paga só no tempo que economiza.',
  },
  {
    name: 'Thiago Rocha',
    role: 'Equipe com 4 pessoas',
    quote:
      'Quando a operação cresceu, subir para BUSINESS foi natural. Roles e equipe tiraram o caos de acesso compartilhado.',
  },
] as const;

const faqs = [
  {
    question: 'Posso começar sem cartão?',
    answer:
      'Sim. O plano FREE é liberado sem cartão. Você só precisa de cobrança quando quiser subir para PRO ou BUSINESS.',
  },
  {
    question: 'O que acontece se o pagamento falhar?',
    answer:
      'Os recursos pagos ficam bloqueados automaticamente e a conta continua operando no nível do FREE até a regularização.',
  },
  {
    question: 'Consigo cancelar quando quiser?',
    answer:
      'Sim. O gerenciamento da assinatura acontece pelo Mercado Pago e o downgrade é refletido automaticamente no sistema.',
  },
  {
    question: 'O FREE já serve para usar de verdade?',
    answer:
      'Serve para começar e validar a rotina. A ideia é usar rápido, ganhar controle e sentir naturalmente quando o upgrade fizer sentido.',
  },
] as const;

export default function MarketingHome() {
  return (
    <div className="marketing-light min-h-screen bg-[#f4f7f4] text-slate-900">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.10),_transparent_28%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                SaaS de estoque para operação enxuta
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Organize estoque, vendas e financeiro sem virar refém de planilha.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  O NexStock junta o núcleo operacional da empresa em um painel mais limpo, mais rápido e muito mais fácil de escalar do que uma rotina espalhada em arquivos e WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_-20px_rgba(5,150,105,0.65)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-20px_rgba(5,150,105,0.72)]"
                >
                  <span>Começar grátis</span>
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </Link>
                <a
                  href="#planos"
                  className="inline-flex items-center justify-center rounded-[22px] border border-slate-200/90 bg-white/90 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-[0_14px_30px_-22px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white hover:text-slate-950"
                >
                  Ver planos
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <Card key={item.label} className="border-white/80 bg-white/90 p-4 backdrop-blur">
                    <div className="text-2xl font-black tracking-tight text-slate-950">{item.value}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.label}</div>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border border-slate-200/70 bg-white/90 p-0 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Painel operacional</div>
                <div className="mt-2 text-2xl font-black tracking-tight">Visibilidade sem ruído</div>
              </div>

              <div className="grid gap-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ['Produtos ativos', '183'],
                    ['Movimentações hoje', '26'],
                    ['Saúde do estoque', '92%'],
                    ['Receita no mês', 'R$ 18.420'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                      <div className="mt-2 text-2xl font-black tracking-tight text-slate-950">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900">
                    Upgrade automático por Mercado Pago, bloqueio por falta de pagamento e controle real de recursos por plano. O sistema continua operacional na base do FREE quando a cobrança falha.
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Plano sugerido</div>
                    <div className="mt-2 text-3xl font-black tracking-tight text-slate-950">PRO</div>
                    <div className="mt-1 text-sm text-slate-500">Para quem quer visão, relatórios e previsibilidade.</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="beneficios" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-6 max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Benefícios</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Organização para vender mais e errar menos</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Controle de estoque real',
                text: 'Veja entradas, saídas, saldo e itens críticos sem depender de conferência manual o tempo inteiro.',
              },
              {
                title: 'Financeiro conectado',
                text: 'Acompanhe transações e relatórios sem ficar pulando entre ferramentas diferentes.',
              },
              {
                title: 'Escala por plano',
                text: 'Comece no FREE e libere recursos pagos só quando a operação pedir mais profundidade.',
              },
            ].map((item) => (
              <Card key={item.title} title={item.title} subtitle={item.text}>
                <div className="h-1 w-16 rounded-full bg-emerald-600" />
              </Card>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Como funciona</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Entrada simples, operação organizada, upgrade natural</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="relative overflow-hidden">
                <div className="absolute right-5 top-5 text-6xl font-black tracking-tight text-slate-100">0{index + 1}</div>
                <div className="relative">
                  <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Etapa {index + 1}</div>
                  <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="O que você gerencia" subtitle="O núcleo operacional já nasce pronto para uso.">
              <ul className="space-y-3 text-sm text-slate-600">
                {['Cadastro e edição de produtos', 'Arquivamento sem perder histórico', 'Movimentações de estoque', 'Relatórios e exportações', 'KPIs e saúde do estoque', 'Equipe e permissões'].map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Por que o NexStock converte melhor" subtitle="Sem enrolação, com limites claros e upgrade natural.">
              <div className="space-y-4 text-sm leading-7 text-slate-600">
                <p>
                  O plano <b>FREE</b> entrega utilidade real, mas bate em limites que fazem sentido. O <b>PRO</b> abre relatórios, KPIs e visão financeira. O <b>BUSINESS</b> libera equipe e escala.
                </p>
                <p>
                  Isso cria uma jornada simples: o cliente entra rápido, usa, cresce e faz upgrade quando a operação realmente precisa.
                </p>
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 font-medium text-amber-800">
                  Pagamento falhou? O backend bloqueia só os recursos pagos e mantém a base do sistema operando no nível do FREE.
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="prova-social" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Prova social</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Quem usa percebe rápido onde o sistema entrega valor</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="h-full">
                <div className="text-lg leading-8 text-slate-700">“{item.quote}”</div>
                <div className="mt-6 border-t border-slate-200 pt-4">
                  <div className="font-black tracking-tight text-slate-950">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Planos</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Escolha o nível certo para a sua operação</h2>
            <p className="mt-3 text-slate-600">Sem contrato travado. Você entra no FREE, sobe para PRO quando precisar de gestão de verdade, e vai para BUSINESS quando a equipe crescer.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'rounded-[28px] border bg-white p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.22)]',
                  plan.featured ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200/80',
                ].join(' ')}
              >
                {plan.featured && (
                  <div className="mb-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Mais vendido
                  </div>
                )}
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">{plan.name}</div>
                <div className="mt-3 text-4xl font-black tracking-tight text-slate-950">{plan.price}</div>
                <div className="mt-3 min-h-[48px] text-sm leading-6 text-slate-600">{plan.subtitle}</div>
                <ul className="mt-6 space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={[
                    'mt-6 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    plan.featured
                      ? 'bg-emerald-700 text-white shadow-[0_10px_24px_-12px_rgba(6,95,70,0.7)] hover:bg-emerald-800'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 max-w-2xl">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">FAQ</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Dúvidas comuns antes de entrar</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <Card key={item.question} title={item.question} subtitle={item.answer} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#052e2b_100%)] px-6 py-10 text-center text-white shadow-[0_40px_90px_-45px_rgba(15,23,42,0.8)] sm:px-10">
            <div className="absolute inset-y-0 right-0 hidden w-72 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.14),_transparent_60%)] lg:block" />
            <div className="relative">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">Pronto para testar?</div>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Crie sua conta e comece no FREE agora</h2>
              <p className="mx-auto mt-3 max-w-2xl text-slate-300">
                Você entra sem cartão, organiza a operação e faz upgrade quando realmente precisar de mais profundidade.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-[22px] bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_24px_50px_-24px_rgba(255,255,255,0.55)] transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  <span>Criar conta grátis</span>
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-[22px] border border-white/15 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/14"
                >
                  Já tenho conta
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Sem cartão no FREE</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Setup rápido</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Upgrade quando fizer sentido</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

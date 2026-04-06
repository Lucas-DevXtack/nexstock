import { Link } from 'react-router-dom';
import PublicHeader from '../../components/public/PublicHeader';
import LegalFooter from '../../components/public/LegalFooter';

const sections = [
  {
    title: '1. Quem trata os seus dados',
    paragraphs: [
      'A NexStock trata dados pessoais para viabilizar cadastro, autenticação, operação da plataforma, suporte, segurança e melhoria contínua do serviço.',
      'Para assuntos de privacidade, o canal principal é privacy@nexstock.com.br. Enquanto o canal definitivo não estiver configurado no seu domínio, substitua esse e-mail pelo endereço real da operação.',
    ],
  },
  {
    title: '2. Dados que podemos coletar',
    paragraphs: [
      'Dados de cadastro e acesso, como nome, e-mail, senha criptografada, empresa vinculada, função dentro da conta e registros de autenticação.',
      'Dados de uso e segurança, como endereço IP ou hash de IP, user-agent, navegador, sistema operacional, horário de acesso, logs técnicos, rotas acessadas, tokens de sessão e eventos de segurança.',
      'Dados operacionais inseridos pelo próprio usuário, como produtos, categorias, estoque, movimentações, transações financeiras, relatórios e informações de equipe.',
      'Dados analíticos de campanhas e QR codes, como slug do QR, URL de destino, origem, meio, campanha, referer e informações técnicas mínimas do dispositivo.',
    ],
  },
  {
    title: '3. Finalidades do tratamento',
    paragraphs: [
      'Usamos os dados para criar e manter a conta, autenticar usuários, liberar recursos contratados, registrar auditoria, gerar relatórios, prevenir fraude, responder suporte e medir uso do produto.',
      'Também usamos dados técnicos e analíticos para entender performance de páginas, origem de acessos, falhas operacionais, segurança da infraestrutura e melhoria da experiência.',
    ],
  },
  {
    title: '4. Bases legais utilizadas',
    paragraphs: [
      'A NexStock trata dados com base em execução de contrato ou procedimentos preliminares relacionados ao uso da plataforma, cumprimento de obrigações legais e regulatórias, legítimo interesse para segurança, prevenção a fraude, analytics e melhoria do serviço, e consentimento quando ele for exigido pela legislação aplicável.',
      'Quando a base legal for legítimo interesse, a NexStock busca coletar o mínimo necessário e reduzir risco com medidas como retenção limitada, controle de acesso e pseudonimização.',
    ],
  },
  {
    title: '5. Compartilhamento de dados',
    paragraphs: [
      'Os dados podem ser compartilhados com operadores e provedores essenciais para o funcionamento da plataforma, como hospedagem, banco de dados, processamento de pagamentos, envio de e-mails transacionais e ferramentas de observabilidade.',
      'Também pode haver compartilhamento para cumprimento de ordem judicial, requisição de autoridade competente ou defesa de direitos da NexStock em processos administrativos, arbitrais ou judiciais.',
      'A NexStock não comercializa dados pessoais dos usuários.',
    ],
  },
  {
    title: '6. Cookies, logs e tecnologias semelhantes',
    paragraphs: [
      'A aplicação pode utilizar cookies, armazenamento local do navegador, tokens e logs técnicos para manter sessão, lembrar preferências, proteger autenticação e medir uso do produto.',
      'Se forem utilizados cookies não estritamente necessários, a recomendação é apresentar mecanismo de consentimento antes da coleta correspondente. Esta política já deixa esse espaço preparado para a evolução do produto.',
    ],
  },
  {
    title: '7. Retenção e descarte',
    paragraphs: [
      'Os dados são mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política, atender obrigações legais, preservar histórico de segurança, auditoria e cobrança, ou resguardar exercício regular de direitos.',
      'Encerrado o prazo de retenção aplicável, os dados podem ser excluídos, anonimizados ou mantidos de forma bloqueada quando a legislação permitir.',
    ],
  },
  {
    title: '8. Segurança da informação',
    paragraphs: [
      'A NexStock adota medidas técnicas e organizacionais razoáveis para reduzir risco de acesso não autorizado, perda, alteração ou destruição indevida dos dados. Essas medidas incluem controle de acesso, segregação por conta, uso de credenciais, registros de auditoria e proteção da infraestrutura.',
      'Nenhum sistema é absolutamente invulnerável. Por isso, além das medidas da plataforma, o usuário também deve proteger senha, dispositivos, e-mails e acessos de equipe.',
    ],
  },
  {
    title: '9. Direitos do titular',
    paragraphs: [
      'Nos termos da LGPD, o titular pode solicitar confirmação da existência de tratamento, acesso, correção, anonimização, bloqueio ou eliminação quando cabível, portabilidade, informação sobre compartilhamento e revisão de decisões automatizadas, quando aplicável.',
      'Pedidos podem ser enviados para o canal de privacidade informado nesta política. Antes de atender a solicitação, a NexStock poderá adotar medidas para confirmar identidade e legitimidade do pedido.',
    ],
  },
  {
    title: '10. Transferências internacionais',
    paragraphs: [
      'Alguns fornecedores de infraestrutura ou comunicação podem processar dados fora do Brasil. Nesses casos, a NexStock buscará adotar salvaguardas compatíveis com a legislação aplicável e com o nível de risco do tratamento.',
    ],
  },
  {
    title: '11. Atualizações desta política',
    paragraphs: [
      'Esta política pode ser atualizada para refletir evolução do produto, ajustes operacionais, exigências legais ou mudanças na infraestrutura. A versão vigente será disponibilizada nesta página com a data de atualização.',
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="marketing-light min-h-screen bg-[#f4f7f4] text-slate-900">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Documento legal
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Política de Privacidade</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Última atualização: 4 de abril de 2026. Este texto foi estruturado para a operação atual da NexStock com web em React/Vite,
            API em Node.js + Express + Prisma e coleta técnica mínima para autenticação, segurança e analytics.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Esta política explica como a NexStock coleta, utiliza, compartilha, protege e retém dados pessoais no contexto do site,
            da aplicação e de interações relacionadas ao serviço.
          </p>

          <div className="mt-8 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-black tracking-tight text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-10 rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            Importante: revise o e-mail de contato, o nome empresarial, o CNPJ, o endereço da empresa e os provedores efetivamente utilizados antes de publicar em produção.
            Esta versão já está pronta para uso como base operacional, mas esses campos devem refletir a operação real.
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
            <Link to="/terms" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
              Ver Termos de Uso
            </Link>
            <Link to="/signup" className="rounded-2xl bg-emerald-700 px-4 py-2.5 text-white transition hover:bg-emerald-800">
              Criar conta
            </Link>
          </div>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

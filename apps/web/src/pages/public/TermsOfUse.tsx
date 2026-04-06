import { Link } from 'react-router-dom';
import PublicHeader from '../../components/public/PublicHeader';
import LegalFooter from '../../components/public/LegalFooter';

const sections = [
  {
    title: '1. Aceitação e escopo',
    paragraphs: [
      'Ao acessar ou utilizar a NexStock, o usuário declara ter lido e concordado com estes Termos de Uso. Se o usuário estiver agindo em nome de empresa, declara possuir poderes para vincular a organização a estes termos.',
      'Os termos regem o acesso ao site, à aplicação, aos planos gratuitos e pagos, às funcionalidades operacionais e aos canais relacionados ao serviço.',
    ],
  },
  {
    title: '2. Conta e credenciais',
    paragraphs: [
      'Para utilizar recursos autenticados, o usuário deve fornecer informações verdadeiras, atualizadas e completas. O acesso é pessoal e intransferível, salvo hipóteses de uso corporativo autorizadas pela própria arquitetura da plataforma, como equipe, convites e papéis de acesso.',
      'O usuário é responsável por manter a confidencialidade das credenciais, por restringir acesso indevido aos seus dispositivos e por notificar a NexStock imediatamente em caso de suspeita de uso não autorizado.',
    ],
  },
  {
    title: '3. Uso permitido da plataforma',
    paragraphs: [
      'A NexStock pode ser utilizada para gestão de estoque, movimentações, relatórios, controle financeiro, auditoria, equipe e demais recursos disponibilizados conforme o plano contratado.',
      'É proibido usar a plataforma para violar a lei, praticar fraude, tentar obter acesso não autorizado, testar vulnerabilidades sem autorização, degradar a infraestrutura, inserir conteúdo malicioso ou utilizar o serviço de modo incompatível com sua finalidade operacional.',
    ],
  },
  {
    title: '4. Planos, cobrança e downgrade',
    paragraphs: [
      'A NexStock pode oferecer planos FREE, PRO e BUSINESS, com limites e recursos distintos. Recursos pagos só ficam disponíveis quando houver contratação válida e status regular de cobrança.',
      'Em caso de falha de pagamento, cancelamento, chargeback, expiração ou bloqueio do meio de cobrança, a NexStock poderá restringir recursos pagos, preservar dados existentes dentro do que for tecnicamente viável e readequar a conta ao nível compatível com o plano ativo.',
      'Preços, limites e regras comerciais podem ser alterados com efeito prospectivo, respeitando a comunicação adequada e a legislação aplicável.',
    ],
  },
  {
    title: '5. Dados inseridos pelo usuário',
    paragraphs: [
      'O usuário é o responsável primário pelos dados, documentos, cadastros, produtos, lançamentos e demais conteúdos inseridos na plataforma. Isso inclui legalidade, exatidão, integridade e legitimidade do tratamento desses dados no contexto da sua própria operação.',
      'A NexStock atua como provedora da infraestrutura da aplicação e pode tratar esses dados para viabilizar o serviço, segurança, suporte, analytics e cumprimento de obrigações legais, nos termos da Política de Privacidade.',
    ],
  },
  {
    title: '6. Propriedade intelectual',
    paragraphs: [
      'O software, a marca, o layout, a identidade visual, o código, a documentação, os textos e os elementos da NexStock são protegidos por direitos de propriedade intelectual e pertencem à NexStock ou a seus licenciantes.',
      'Estes termos não concedem cessão de propriedade intelectual. O usuário recebe apenas uma licença limitada, não exclusiva, revogável e intransferível para usar a plataforma conforme estes termos.',
    ],
  },
  {
    title: '7. Disponibilidade, suporte e mudanças',
    paragraphs: [
      'A NexStock busca manter o serviço disponível e seguro, mas não garante funcionamento ininterrupto, livre de falhas, atrasos, indisponibilidade de terceiros, incidentes de rede ou eventos fora do controle razoável da operação.',
      'Recursos podem ser adicionados, alterados, descontinuados ou limitados por motivos técnicos, comerciais, regulatórios ou de segurança.',
    ],
  },
  {
    title: '8. Limitação de responsabilidade',
    paragraphs: [
      'Na máxima extensão permitida pela lei, a NexStock não responde por lucros cessantes, perda de oportunidade, perda indireta, dano reputacional, dano consequencial ou prejuízos decorrentes de uso inadequado da plataforma, erro de cadastro, falha de terceiros, indisponibilidade temporária ou decisão operacional tomada exclusivamente com base no sistema.',
      'A responsabilidade da NexStock, quando cabível, tende a ficar limitada aos valores efetivamente pagos pelo usuário nos 12 meses anteriores ao evento que gerou a reclamação, salvo se a legislação aplicável exigir solução diversa.',
    ],
  },
  {
    title: '9. Suspensão e encerramento',
    paragraphs: [
      'A NexStock poderá suspender ou encerrar contas, acessos, convites ou uso de funcionalidades em caso de violação destes termos, risco de segurança, fraude, inadimplência, determinação legal ou uso que exponha a operação a risco técnico ou jurídico relevante.',
      'O usuário também pode encerrar o uso da plataforma, observadas as regras de cobrança e eventuais prazos operacionais necessários para processamento técnico do encerramento.',
    ],
  },
  {
    title: '10. Privacidade e proteção de dados',
    paragraphs: [
      'O tratamento de dados pessoais relacionado à prestação do serviço segue a Política de Privacidade da NexStock, que integra estes termos para todos os fins aplicáveis.',
    ],
  },
  {
    title: '11. Lei aplicável e foro',
    paragraphs: [
      'Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca do domicílio da NexStock, salvo disposição legal imperativa em sentido diverso.',
    ],
  },
  {
    title: '12. Contato',
    paragraphs: [
      'Para dúvidas jurídicas, notificações ou questões relacionadas a estes termos, utilize o canal informado na Política de Privacidade ou o endereço de contato oficial que estiver publicado pela NexStock.',
    ],
  },
];

export default function TermsOfUse() {
  return (
    <div className="marketing-light min-h-screen bg-[#f4f7f4] text-slate-900">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Documento legal
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Termos de Uso</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Última atualização: 4 de abril de 2026. Estes termos disciplinam o acesso e o uso da NexStock por usuários, equipes e empresas vinculadas à plataforma.
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
            Antes de publicar em produção, revise nome empresarial, CNPJ, endereço, política comercial, provedores de pagamento e foro desejado para refletir a realidade da operação.
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium">
            <Link to="/privacy" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950">
              Ver Política de Privacidade
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

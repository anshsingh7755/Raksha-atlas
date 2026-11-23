import ProgrammeDossierExplorer from "./ProgrammeDossierExplorer";

export default function Programmes() {
  return (
    <section className="page-section">
          <div className="page-hero">
            <span className="section-kicker">MODERNISATION / PROGRAMME LEDGER</span>
            <h1>
              Programmes in <em>motion.</em>
            </h1>
            <p>
              Browse official programmes, acquisition approvals, contracts and reported plans. Each record keeps its evidence trail; a proposal or AoN is not a contract, delivery or induction.
            </p>
          </div>
          <ProgrammeDossierExplorer />
        </section>
  );
}

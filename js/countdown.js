/* =====================================================
   FPSS 2027 — CONTADOR OFICIAL
   Atualiza: #mini-dias, #mini-horas, #mini-minutos, #mini-segundos
             (hero card) — sem depender de #countdown
===================================================== */

(function () {

  const ALVO = new Date("2027-01-24T10:00:00").getTime();

  /* IDs do hero card */
  const elDias   = document.getElementById("mini-dias");
  const elHoras  = document.getElementById("mini-horas");
  const elMin    = document.getElementById("mini-minutos");
  const elSeg    = document.getElementById("mini-segundos");

  /* Se não achar nenhum elemento, aborta */
  if (!elDias && !elHoras && !elMin && !elSeg) return;

  function dois(n) { return String(n).padStart(2, "0"); }

  function atualizar() {
    const diff = ALVO - Date.now();

    if (diff <= 0) {
      [elDias, elHoras, elMin, elSeg].forEach(el => {
        if (el) el.textContent = "00";
      });
      if (elDias) elDias.textContent = "🎉";
      clearInterval(timer);
      return;
    }

    const dias     = Math.floor(diff / 864e5);
    const horas    = Math.floor((diff % 864e5) / 36e5);
    const minutos  = Math.floor((diff % 36e5) / 6e4);
    const segundos = Math.floor((diff % 6e4) / 1e3);

    if (elDias)  elDias.textContent  = dias;
    if (elHoras) elHoras.textContent = dois(horas);
    if (elMin)   elMin.textContent   = dois(minutos);
    if (elSeg)   elSeg.textContent   = dois(segundos);
  }

  atualizar();
  const timer = setInterval(atualizar, 1000);

})();

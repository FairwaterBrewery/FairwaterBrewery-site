(function() {
  const recipeKey = window.location.pathname;
  const saved = JSON.parse(localStorage.getItem(recipeKey) || "{}");

  const checkboxes = document.querySelectorAll("#checklist input[type=checkbox]");

  checkboxes.forEach(cb => {
    const id = cb.dataset.stepId;
    if (saved[id]) cb.checked = true;

    cb.addEventListener("change", () => {
      saved[id] = cb.checked;
      localStorage.setItem(recipeKey, JSON.stringify(saved));
    });
  });

  const reset = document.getElementById("reset");
  if (reset) {
    reset.addEventListener("click", () => {
      localStorage.removeItem(recipeKey);
      location.reload();
    });
  }
})();

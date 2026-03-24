(function(){
  function cleanLabel(text){
    return String(text||'').replace(/\s+/g,' ').trim();
  }

  function shortDescription(topic, course){
    var t = String(topic||'').toLowerCase();
    if (t.includes('interview')) return 'Key interview patterns, practical questions, and answer framing so candidates can communicate confidently.';
    if (t.includes('project') || t.includes('dashboard')) return 'Hands-on build phase where learners apply all previous concepts in a portfolio-ready case.';
    if (t.includes('fundament') || t.includes('basic')) return 'Foundation concepts explained with examples to build confidence before advanced modules.';
    if (t.includes('power query')) return 'Learn import, clean, and transform workflows used in real reporting pipelines.';
    if (t.includes('dax')) return 'Create business metrics and reusable calculations for decision-ready dashboards.';
    if (t.includes('join')) return 'Combine related tables correctly for analysis-ready datasets and reporting logic.';
    if (t.includes('oop')) return 'Object-oriented design basics that improve code structure and reusability.';
    if (t.includes('api')) return 'Fetch real-world data, parse responses, and automate input pipelines.';
    if (t.includes('pandas')) return 'Tabular data cleaning, analysis, and transformation using industry-standard workflows.';
    if (t.includes('optimization')) return 'Performance tuning practices to improve query/model speed and reliability.';
    if (t.includes('formula')) return 'High-impact formulas and nested logic for faster spreadsheet problem solving.';
    if (t.includes('data cleaning')) return 'Practical steps to standardize, validate, and prepare clean data for analysis.';
    if (t.includes('neural') || t.includes('deep')) return 'Core deep learning concepts with intuition and applied mini examples.';
    if (t.includes('tableau') || t.includes('power bi')) return 'Visualization best practices for clear storytelling and decision support.';
    if (t.includes('excel')) return 'Spreadsheet productivity techniques used in business reporting and operations.';
    if (course.includes('HR')) return 'Job-application oriented module to improve outreach quality and response rates.';
    return 'Short practical module focused on skills used in real projects and job tasks.';
  }

  function enhanceCard(card, heading){
    var steps = Array.from(card.querySelectorAll('.step'));
    if (!steps.length) return;

    var tip = document.createElement('div');
    tip.className = 'roadmap-title-tip';
    tip.textContent = 'Click any topic to view a short description.';
    heading.insertAdjacentElement('afterend', tip);

    steps.forEach(function(step, idx){
      var raw = cleanLabel(step.textContent);
      var topic = raw.replace(/^Step\s*\d+\s*:\s*/i,'').replace(/^Section\s*\d+\s*:\s*/i,'');
      var details = document.createElement('details');
      details.className = 'roadmap-item';
      var summary = document.createElement('summary');
      summary.textContent = (idx + 1) + '. ' + topic;
      var desc = document.createElement('p');
      desc.textContent = shortDescription(topic, heading.textContent || '');
      details.appendChild(summary);
      details.appendChild(desc);
      step.replaceWith(details);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.card').forEach(function(card){
      var heading = card.querySelector('h3');
      if (!heading) return;
      var text = (heading.textContent || '').toLowerCase();
      if (text.includes('roadmap') || text.includes('what you will get')) {
        enhanceCard(card, heading);
      }
    });
  });
})();

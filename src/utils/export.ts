import { PartyPlan, ItemCategory } from '../types';

export const CATEGORY_LABELS: Record<ItemCategory, { label: string; icon: string; color: string }> = {
  food_mains: { label: 'Food & Mains', icon: 'Utensils', color: 'emerald' },
  appetizers_snacks: { label: 'Appetizers & Snacks', icon: 'Cookie', color: 'amber' },
  beverages_bar: { label: 'Beverages, Bar & Ice', icon: 'Wine', color: 'blue' },
  desserts_bakery: { label: 'Desserts & Bakery', icon: 'Cake', color: 'pink' },
  decorations_theme: { label: 'Decorations & Ambiance', icon: 'Sparkles', color: 'purple' },
  tableware_disposables: { label: 'Tableware & Disposables', icon: 'Layers', color: 'cyan' },
  entertainment_favors: { label: 'Entertainment & Favors', icon: 'Gamepad2', color: 'indigo' },
  emergency_essentials: { label: 'Essentials & Emergency Kit', icon: 'ShieldAlert', color: 'rose' }
};

export function exportPlanAsMarkdown(plan: PartyPlan): string {
  const totalEst = plan.items.reduce((acc, i) => acc + (i.estimatedCost || 0), 0);
  const totalActual = plan.items.reduce((acc, i) => acc + (i.actualCost || i.estimatedCost || 0), 0);

  let md = `# 🛒 Party Shopping Plan: ${plan.title}\n\n`;
  md += `**Theme:** ${plan.theme} | **Type:** ${plan.partyType} | **Duration:** ${plan.durationHours} hrs\n`;
  md += `**Headcount:** ${plan.headcount.total} guests (${plan.headcount.adults} Adults, ${plan.headcount.teens} Teens, ${plan.headcount.kids} Kids)\n`;
  md += `**Budget Target:** $${plan.budget.target} | **Current Estimate:** $${totalEst} | **Cost/Guest:** $${(totalEst / Math.max(1, plan.headcount.total)).toFixed(2)}\n\n`;

  if (plan.signatureItem) {
    md += `## 🍹 Signature Item: ${plan.signatureItem.name}\n`;
    md += `${plan.signatureItem.description}\n`;
    md += `*Ingredients:* ${plan.signatureItem.ingredientsList.join(', ')}\n\n`;
  }

  md += `## 📋 Shopping Checklist\n\n`;

  // Group by category
  const categories = Object.keys(CATEGORY_LABELS) as ItemCategory[];
  for (const cat of categories) {
    const items = plan.items.filter(i => i.category === cat);
    if (items.length === 0) continue;

    md += `### ${CATEGORY_LABELS[cat].label}\n`;
    for (const item of items) {
      const checkbox = item.isPurchased ? '[x]' : '[ ]';
      const cost = item.estimatedCost ? `$${item.estimatedCost}` : 'TBD';
      md += `- ${checkbox} **${item.name}** — ${item.quantity} ${item.unit} (~${cost}) | *Store: ${item.store} (${item.department})*\n`;
      if (item.notes) md += `  - *Note:* ${item.notes}\n`;
    }
    md += `\n`;
  }

  if (plan.expertTips && plan.expertTips.length > 0) {
    md += `## 💡 Host Pro-Tips\n`;
    for (const tip of plan.expertTips) {
      md += `- ${tip}\n`;
    }
    md += `\n`;
  }

  if (plan.timelineMilestones && plan.timelineMilestones.length > 0) {
    md += `## ⏱️ Preparation & Shopping Timeline\n`;
    for (const milestone of plan.timelineMilestones) {
      md += `### ${milestone.timing}\n`;
      for (const task of milestone.tasks) {
        md += `- [ ] ${task}\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

export function exportPlanAsCSV(plan: PartyPlan): string {
  const headers = ['Category', 'Item Name', 'Quantity', 'Unit', 'Estimated Cost ($)', 'Store', 'Department', 'Purchased', 'Priority', 'Notes'];
  const rows = plan.items.map(i => [
    `"${CATEGORY_LABELS[i.category]?.label || i.category}"`,
    `"${i.name.replace(/"/g, '""')}"`,
    `"${i.quantity}"`,
    `"${i.unit}"`,
    i.estimatedCost,
    `"${i.store.replace(/"/g, '""')}"`,
    `"${i.department.replace(/"/g, '""')}"`,
    i.isPurchased ? 'YES' : 'NO',
    `"${i.priority}"`,
    `"${(i.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

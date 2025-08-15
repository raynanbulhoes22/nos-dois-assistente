import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { AdvancedReportsData } from '@/hooks/useAdvancedReportsData';

export interface ExportData {
  reportData: AdvancedReportsData;
  filteredTransactions: any[];
}

export const generateFileName = (type: 'pdf' | 'excel' | 'csv', filters: any) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  const period = filters?.period?.preset || filters?.groupBy || 'relatorio';
  return `relatorio-financeiro-${period}-${date}.${type === 'excel' ? 'xlsx' : type}`;
};

// Função para aguardar o carregamento completo dos gráficos
const waitForChartsToLoad = (element: HTMLElement, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = timeout / 100;
    
    const checkCharts = () => {
      attempts++;
      
      // Verificar se todos os SVGs dos gráficos foram renderizados
      const charts = element.querySelectorAll('.recharts-wrapper');
      const svgs = element.querySelectorAll('svg');
      
      const allChartsLoaded = Array.from(charts).every(chart => {
        const svg = chart.querySelector('svg');
        return svg && svg.children.length > 0;
      });
      
      const allSvgsLoaded = Array.from(svgs).every(svg => {
        return svg.getBBox ? svg.getBBox().width > 0 : true;
      });
      
      if (allChartsLoaded && allSvgsLoaded) {
        resolve();
      } else if (attempts >= maxAttempts) {
        resolve(); // Continuar mesmo se não carregou completamente
      } else {
        setTimeout(checkCharts, 100);
      }
    };
    
    checkCharts();
  });
};

// Função para otimizar elemento para captura
const optimizeElementForCapture = (element: HTMLElement) => {
  // Forçar renderização de elementos lazy
  const lazyElements = element.querySelectorAll('[data-lazy]');
  lazyElements.forEach(el => {
    (el as HTMLElement).style.opacity = '1';
    (el as HTMLElement).style.visibility = 'visible';
  });
  
  // Garantir que todos os SVGs estejam visíveis
  const svgs = element.querySelectorAll('svg');
  svgs.forEach(svg => {
    svg.style.opacity = '1';
    svg.style.visibility = 'visible';
  });
  
  // Remover elementos que podem causar problemas na captura
  const problematicElements = element.querySelectorAll(
    '.scroll-area-viewport, .overflow-hidden, .sticky, .fixed, .absolute'
  );
  problematicElements.forEach(el => {
    (el as HTMLElement).style.overflow = 'visible';
    (el as HTMLElement).style.position = 'static';
  });
};

export const exportToPDF = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.reportData) {
      throw new Error('Dados do relatório não encontrados');
    }
    
    // Tentar encontrar o elemento do relatório com fallbacks
    let reportElement = document.getElementById('relatorios-content');
    
    if (!reportElement) {
      // Fallback 1: procurar por classe
      reportElement = document.querySelector('.relatorios-content') as HTMLElement;
    }
    
    if (!reportElement) {
      // Fallback 2: procurar por data attribute
      reportElement = document.querySelector('[data-export="relatorios"]') as HTMLElement;
    }
    
    if (!reportElement) {
      // Fallback 3: capturar todo o main content
      reportElement = document.querySelector('main') as HTMLElement;
    }
    
    if (!reportElement) {
      throw new Error('Elemento do relatório não encontrado. Verifique se a página está carregada.');
    }

    // Otimizar elemento para captura
    optimizeElementForCapture(reportElement);
    
    // Aguardar carregamento dos gráficos
    await waitForChartsToLoad(reportElement);
    
    // Pequena pausa adicional para garantir renderização
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Configuração aprimorada do html2canvas
    const canvas = await html2canvas(reportElement, {
      scale: 2, // Melhor qualidade
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 20000,
      removeContainer: false,
      foreignObjectRendering: true,
      width: reportElement.scrollWidth,
      height: reportElement.scrollHeight,
      windowWidth: 1200, // Largura fixa para consistência
      windowHeight: 800,
      x: 0,
      y: 0,
      ignoreElements: (element) => {
        return element.classList.contains('scroll-bar') || 
               element.classList.contains('fixed') ||
               element.classList.contains('sticky') ||
               element.classList.contains('absolute') ||
               element.tagName === 'BUTTON' && element.textContent?.includes('Export');
      },
      onclone: (clonedDoc) => {
        // Otimizar documento clonado para PDF
        const clonedElement = clonedDoc.querySelector('#relatorios-content, .relatorios-content, [data-export="relatorios"], main');
        if (clonedElement) {
          const element = clonedElement as HTMLElement;
          
          // Forçar layout estático
          element.style.position = 'static';
          element.style.overflow = 'visible';
          element.style.maxHeight = 'none';
          element.style.height = 'auto';
          
          // Otimizar todos os gráficos
          const charts = element.querySelectorAll('.recharts-wrapper');
          charts.forEach(chart => {
            (chart as HTMLElement).style.position = 'static';
            (chart as HTMLElement).style.overflow = 'visible';
          });
          
          // Forçar visibilidade de todos os SVGs
          const svgs = element.querySelectorAll('svg');
          svgs.forEach(svg => {
            svg.style.opacity = '1';
            svg.style.visibility = 'visible';
            svg.style.display = 'block';
          });
          
          // Remover elementos problemáticos
          const problematicElements = element.querySelectorAll('.scroll-area-viewport, .overflow-auto, .overflow-hidden');
          problematicElements.forEach(el => {
            (el as HTMLElement).style.overflow = 'visible';
            (el as HTMLElement).style.maxHeight = 'none';
          });
        }
      }
    });

    // Criar PDF otimizado
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 16
    });
    
    const imgWidth = 190; // Largura com margens
    const pageHeight = 297; // A4 height
    const marginTop = 60;
    const marginBottom = 20;
    const availableHeight = pageHeight - marginTop - marginBottom;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Cabeçalho melhorado
    pdf.setFillColor(248, 250, 252); // bg-slate-50
    pdf.rect(0, 0, 210, 55, 'F');
    
    pdf.setTextColor(30, 41, 59); // text-slate-800
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Relatório Financeiro', 20, 25);
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105); // text-slate-600
    
    const periodText = filters?.startDate && filters?.endDate
      ? `Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy', { locale: ptBR })} - ${format(new Date(filters.endDate), 'dd/MM/yyyy', { locale: ptBR })}`
      : 'Período: Não especificado';
    pdf.text(periodText, 20, 35);
    pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 20, 42);
    
    // Adicionar KPIs no cabeçalho
    if (data.reportData.kpis) {
      const kpis = data.reportData.kpis;
      pdf.setFontSize(9);
      pdf.setTextColor(34, 197, 94); // text-green-500
      pdf.text(`Receitas: R$ ${kpis.totalIncome.toLocaleString('pt-BR')}`, 20, 50);
      pdf.setTextColor(239, 68, 68); // text-red-500
      pdf.text(`Despesas: R$ ${kpis.totalExpenses.toLocaleString('pt-BR')}`, 80, 50);
      pdf.setTextColor(kpis.netBalance >= 0 ? 34 : 239, kpis.netBalance >= 0 ? 197 : 68, kpis.netBalance >= 0 ? 94 : 68);
      pdf.text(`Saldo: R$ ${kpis.netBalance.toLocaleString('pt-BR')}`, 140, 50);
    }
    
    // Linha divisória
    pdf.setDrawColor(203, 213, 225); // border-slate-300
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);

    // Adicionar conteúdo com melhor qualidade
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    if (imgHeight <= availableHeight) {
      // Uma página
      pdf.addImage(imgData, 'JPEG', 10, marginTop, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Múltiplas páginas com melhor divisão
      let remainingHeight = imgHeight;
      let sourceY = 0;
      let pageNum = 1;
      
      while (remainingHeight > 0) {
        if (pageNum > 1) {
          pdf.addPage();
          // Cabeçalho das páginas seguintes
          pdf.setFillColor(248, 250, 252);
          pdf.rect(0, 0, 210, 25, 'F');
          pdf.setFontSize(12);
          pdf.setTextColor(71, 85, 105);
          pdf.text(`Relatório Financeiro - Página ${pageNum}`, 20, 15);
          pdf.line(20, 20, 190, 20);
        }
        
        const currentPageHeight = pageNum === 1 ? availableHeight : pageHeight - 35;
        const sectionHeight = Math.min(currentPageHeight, remainingHeight);
        
        // Criar seção da imagem
        const sectionCanvas = document.createElement('canvas');
        const ctx = sectionCanvas.getContext('2d');
        
        if (ctx) {
          const sourceHeight = (sectionHeight * canvas.width) / imgWidth;
          sectionCanvas.width = canvas.width;
          sectionCanvas.height = sourceHeight;
          
          ctx.drawImage(
            canvas,
            0, sourceY * canvas.width / imgWidth,
            canvas.width, sourceHeight,
            0, 0,
            canvas.width, sourceHeight
          );
          
          const sectionData = sectionCanvas.toDataURL('image/jpeg', 0.95);
          const yPos = pageNum === 1 ? marginTop : 25;
          
          pdf.addImage(sectionData, 'JPEG', 10, yPos, imgWidth, sectionHeight, undefined, 'FAST');
        }
        
        remainingHeight -= sectionHeight;
        sourceY += sectionHeight;
        pageNum++;
      }
    }

    // Rodapé
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // text-slate-400
      pdf.text(`Página ${i} de ${totalPages}`, 170, pageHeight - 10);
    }

    // Salvar com nome melhorado
    const fileName = generateFileName('pdf', filters);
    pdf.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha ao gerar PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

export const exportToExcel = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.reportData || !data.filteredTransactions) {
      throw new Error('Dados insuficientes para gerar Excel');
    }
    
    const { reportData, filteredTransactions } = data;
    
    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Aba 1: Resumo Executivo
    const summaryData = [
      ['RELATÓRIO FINANCEIRO'],
      [''],
      ['Período:', filters?.startDate && filters?.endDate
        ? `${format(new Date(filters.startDate), 'dd/MM/yyyy')} - ${format(new Date(filters.endDate), 'dd/MM/yyyy')}`
        : 'Período não especificado'],
      ['Gerado em:', format(new Date(), 'dd/MM/yyyy HH:mm')],
      [''],
      ['INDICADORES PRINCIPAIS'],
      ['Receitas Totais', `R$ ${reportData.kpis.totalIncome.toFixed(2)}`],
      ['Despesas Totais', `R$ ${reportData.kpis.totalExpenses.toFixed(2)}`],
      ['Saldo Líquido', `R$ ${reportData.kpis.netBalance.toFixed(2)}`],
      ['Taxa de Poupança', `${reportData.kpis.savingsRate.toFixed(1)}%`],
      [''],
      ['TRANSAÇÕES'],
      ['Total de Transações', filteredTransactions.length],
      ['Receitas', filteredTransactions.filter(t => t.tipo === 'entrada').length],
      ['Despesas', filteredTransactions.filter(t => t.tipo === 'saida').length],
    ];

    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWS, 'Resumo');

    // Aba 2: Transações
    const transactionsData = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Forma de Pagamento']
    ];

    filteredTransactions.forEach(transaction => {
      transactionsData.push([
        format(new Date(transaction.data), 'dd/MM/yyyy'),
        transaction.descricao,
        transaction.categoria,
        transaction.valor,
        transaction.tipo,
        transaction.forma_pagamento || 'N/A'
      ]);
    });

    const transactionsWS = XLSX.utils.aoa_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(workbook, transactionsWS, 'Transações');

    // Aba 3: Análise por Categoria
    if (reportData.categoryAnalysis.length > 0) {
      const categoryData = [
        ['Categoria', 'Total Gasto', 'Percentual', 'Nº Transações', 'Ticket Médio']
      ];

      reportData.categoryAnalysis.forEach(category => {
        categoryData.push([
          category.name,
          `R$ ${category.amount.toFixed(2)}`,
          `${category.percentage.toFixed(1)}%`,
          category.transactionCount.toString(),
          `R$ ${category.avgAmount.toFixed(2)}`
        ]);
      });

      const categoryWS = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categoryWS, 'Análise por Categoria');
    }

    // Aba 4: Formas de Pagamento
    if (reportData.paymentMethodAnalysis.length > 0) {
      const paymentData = [
        ['Forma de Pagamento', 'Total', 'Percentual', 'Nº Transações']
      ];

      reportData.paymentMethodAnalysis.forEach(payment => {
        paymentData.push([
          payment.method,
          `R$ ${payment.amount.toFixed(2)}`,
          `${payment.percentage.toFixed(1)}%`,
          payment.transactionCount.toString()
        ]);
      });

      const paymentWS = XLSX.utils.aoa_to_sheet(paymentData);
      XLSX.utils.book_append_sheet(workbook, paymentWS, 'Formas de Pagamento');
    }

    // Salvar arquivo
    const fileName = generateFileName('excel', filters);
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Erro ao gerar Excel:', error);
    throw new Error('Falha ao gerar Excel');
  }
};

export const exportToCSV = async (data: ExportData, filters: any) => {
  try {
    // Validar dados
    if (!data || !data.filteredTransactions) {
      throw new Error('Transações não encontradas para exportação');
    }
    
    const { filteredTransactions } = data;
    
    // Preparar dados para CSV
    const csvData = [
      ['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Forma de Pagamento']
    ];

    filteredTransactions.forEach(transaction => {
      csvData.push([
        format(new Date(transaction.data), 'dd/MM/yyyy'),
        transaction.descricao,
        transaction.categoria,
        transaction.valor.toString().replace('.', ','), // Formato brasileiro
        transaction.tipo,
        transaction.forma_pagamento || 'N/A'
      ]);
    });

    // Converter para CSV
    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(';')
    ).join('\n');

    // Adicionar BOM para caracteres especiais
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', generateFileName('csv', filters));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, fileName: generateFileName('csv', filters) };
  } catch (error) {
    console.error('Erro ao gerar CSV:', error);
    throw new Error('Falha ao gerar CSV');
  }
};
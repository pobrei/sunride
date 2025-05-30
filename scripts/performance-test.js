#!/usr/bin/env node

/**
 * Performance testing script for SunRide application
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Get file size in KB
function getFileSize(filePath) {
  if (!fileExists(filePath)) return 0;
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

// Analyze bundle sizes
function analyzeBundleSizes() {
  logSection('Bundle Size Analysis');
  
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fileExists(buildDir)) {
    logError('Build directory not found. Run "npm run build" first.');
    return;
  }

  // Check main bundle files
  const staticDir = path.join(buildDir, 'static');
  const chunksDir = path.join(staticDir, 'chunks');
  
  if (fileExists(chunksDir)) {
    const chunks = fs.readdirSync(chunksDir)
      .filter(file => file.endsWith('.js'))
      .map(file => ({
        name: file,
        size: getFileSize(path.join(chunksDir, file))
      }))
      .sort((a, b) => b.size - a.size);

    logInfo('Largest JavaScript chunks:');
    chunks.slice(0, 10).forEach(chunk => {
      const sizeColor = chunk.size > 500 ? 'red' : chunk.size > 250 ? 'yellow' : 'green';
      log(`  ${chunk.name}: ${chunk.size}KB`, sizeColor);
    });

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    log(`\nTotal JS bundle size: ${totalSize}KB`, totalSize > 2000 ? 'red' : 'green');
    
    if (totalSize > 2000) {
      logWarning('Bundle size is large. Consider code splitting and tree shaking.');
    } else {
      logSuccess('Bundle size is within acceptable limits.');
    }
  }
}

// Check for performance optimizations
function checkOptimizations() {
  logSection('Performance Optimizations Check');

  // Check Next.js config
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fileExists(nextConfigPath)) {
    const config = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (config.includes('optimizePackageImports')) {
      logSuccess('Package import optimization enabled');
    } else {
      logWarning('Package import optimization not enabled');
    }

    if (config.includes('splitChunks')) {
      logSuccess('Code splitting configured');
    } else {
      logWarning('Code splitting not configured');
    }

    if (config.includes('compress: true')) {
      logSuccess('Compression enabled');
    } else {
      logWarning('Compression not enabled');
    }
  }

  // Check for React.memo usage
  const srcDir = path.join(process.cwd(), 'src');
  if (fileExists(srcDir)) {
    let memoUsage = 0;
    let totalComponents = 0;

    function scanDirectory(dir) {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Count components (rough estimate)
          const componentMatches = content.match(/export\s+(default\s+)?function\s+\w+|export\s+const\s+\w+\s*=\s*\(/g);
          if (componentMatches) {
            totalComponents += componentMatches.length;
          }
          
          // Count memo usage
          if (content.includes('React.memo') || content.includes('memo(')) {
            memoUsage++;
          }
        }
      });
    }

    scanDirectory(srcDir);
    
    const memoPercentage = totalComponents > 0 ? Math.round((memoUsage / totalComponents) * 100) : 0;
    log(`React.memo usage: ${memoUsage} components (${memoPercentage}% of total)`, 
        memoPercentage > 20 ? 'green' : 'yellow');
  }
}

// Performance recommendations
function generateRecommendations() {
  logSection('Performance Recommendations');

  const recommendations = [
    {
      title: 'Bundle Optimization',
      items: [
        'Enable tree shaking for unused code elimination',
        'Use dynamic imports for code splitting',
        'Optimize package imports with Next.js experimental features'
      ]
    },
    {
      title: 'React Performance',
      items: [
        'Use React.memo for expensive components',
        'Implement useCallback for event handlers',
        'Use useMemo for expensive calculations'
      ]
    },
    {
      title: 'Monitoring',
      items: [
        'Set up Web Vitals tracking',
        'Monitor bundle size changes',
        'Track user interactions and performance'
      ]
    }
  ];

  recommendations.forEach(section => {
    log(`\n${section.title}:`, 'bright');
    section.items.forEach(item => {
      log(`  • ${item}`, 'cyan');
    });
  });
}

// Main execution
function main() {
  log('🚀 SunRide Performance Analysis', 'bright');
  log('Analyzing application performance...', 'blue');

  try {
    analyzeBundleSizes();
    checkOptimizations();
    generateRecommendations();

    logSection('Summary');
    logSuccess('Performance analysis completed!');
    logInfo('Run "npm run analyze" to generate detailed bundle analysis');
    logInfo('Run "npm run build" to see build-time optimizations');
    
  } catch (error) {
    logError(`Analysis failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  analyzeBundleSizes,
  checkOptimizations,
  generateRecommendations
};

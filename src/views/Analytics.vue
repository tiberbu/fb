<template>
  <div class="analytics-dashboard">
    <!-- Overview Cards -->
    <div class="overview-cards">
      <div class="metric-card">
        <div class="metric-icon submissions">
          <i class="fas fa-chart-line" />
        </div>
        <div class="metric-content">
          <h3 class="metric-number">
            {{ totalSubmissions }}
          </h3>
          <p class="metric-label">
            Total Submissions
          </p>
          <span class="metric-change positive">
            +{{ weeklyGrowth }}% this week
          </span>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon forms">
          <i class="fas fa-file-alt" />
        </div>
        <div class="metric-content">
          <h3 class="metric-number">
            {{ activeForms }}
          </h3>
          <p class="metric-label">
            Active Forms
          </p>
          <span class="metric-change neutral">
            {{ totalForms }} total forms
          </span>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon conversion">
          <i class="fas fa-percentage" />
        </div>
        <div class="metric-content">
          <h3 class="metric-number">
            {{ conversionRate }}%
          </h3>
          <p class="metric-label">
            Avg. Conversion Rate
          </p>
          <span class="metric-change positive">
            +2.3% from last month
          </span>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon response">
          <i class="fas fa-clock" />
        </div>
        <div class="metric-content">
          <h3 class="metric-number">
            {{ avgResponseTime }}
          </h3>
          <p class="metric-label">
            Avg. Response Time
          </p>
          <span class="metric-change positive">
            -15s from last week
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <h3 class="chart-title">
            Submission Trends
          </h3>
          <div class="chart-controls">
            <button 
              v-for="period in timePeriods"
              :key="period.value"
              class="period-btn"
              :class="{ active: selectedPeriod === period.value }"
              @click="selectedPeriod = period.value"
            >
              {{ period.label }}
            </button>
          </div>
        </div>
        
        <div class="chart-placeholder">
          <div class="chart-visual">
            <div class="chart-bars">
              <div 
                v-for="(value, index) in chartData"
                :key="index"
                class="bar"
                :style="{ height: `${(value / Math.max(...chartData)) * 100}%` }"
              />
            </div>
            <div class="chart-labels">
              <span 
                v-for="(label, index) in chartLabels"
                :key="index"
                class="chart-label"
              >
                {{ label }}
              </span>
            </div>
          </div>
          
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color submissions" />
              <span>Submissions</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stats-panels">
        <div class="panel">
          <h4 class="panel-title">
            Top Performing Forms
          </h4>
          
          <div class="form-stats-list">
            <div 
              v-for="form in topForms"
              :key="form.id"
              class="form-stat-item"
            >
              <div class="form-stat-info">
                <h5 class="form-stat-name">
                  {{ form.name }}
                </h5>
                <p class="form-stat-meta">
                  {{ form.submissions }} submissions
                </p>
              </div>
              
              <div class="form-stat-progress">
                <div 
                  class="progress-bar"
                  :style="{ width: `${(form.submissions / maxSubmissions) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div class="panel">
          <h4 class="panel-title">
            Recent Activity
          </h4>
          
          <div class="activity-list">
            <div 
              v-for="activity in recentActivity"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <i :class="activity.icon" />
              </div>
              
              <div class="activity-content">
                <p class="activity-text">
                  {{ activity.text }}
                </p>
                <span class="activity-time">
                  {{ activity.time }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Statistics -->
    <div class="detailed-stats">
      <div class="stats-table-container">
        <h3 class="section-title">
          Form Performance Breakdown
        </h3>
        
        <div class="stats-table">
          <div class="table-header">
            <div class="header-cell">
              Form Name
            </div>
            <div class="header-cell">
              Submissions
            </div>
            <div class="header-cell">
              Conversion Rate
            </div>
            <div class="header-cell">
              Avg. Completion Time
            </div>
            <div class="header-cell">
              Last Submission
            </div>
          </div>
          
          <div 
            v-for="stat in formStats"
            :key="stat.id"
            class="table-row"
          >
            <div class="table-cell">
              <div class="form-info">
                <h5 class="form-name">
                  {{ stat.name }}
                </h5>
                <span 
                  class="form-status"
                  :class="stat.status"
                >
                  {{ stat.status }}
                </span>
              </div>
            </div>
            
            <div class="table-cell">
              <span class="metric-value">{{ stat.submissions }}</span>
            </div>
            
            <div class="table-cell">
              <span class="metric-value">{{ stat.conversionRate }}%</span>
            </div>
            
            <div class="table-cell">
              <span class="metric-value">{{ stat.avgTime }}</span>
            </div>
            
            <div class="table-cell">
              <span class="metric-value">{{ stat.lastSubmission }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFormAPI } from '@/composables/useFormAPI'

const { savedForms, submissions, loadSavedForms, loadSubmissions } = useFormAPI()

const selectedPeriod = ref('7d')

const timePeriods = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '1Y', value: '1y' }
]

// Mock data for demonstration
const chartData = ref([45, 52, 38, 68, 75, 62, 58])
const chartLabels = ref(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])

const totalSubmissions = computed(() => submissions.value.length)
const totalForms = computed(() => savedForms.value.length)
const activeForms = computed(() => savedForms.value.filter((f: any) => f.isActive).length)

const weeklyGrowth = computed(() => {
  // Mock calculation - in real app, compare with previous week
  return 12.5
})

const conversionRate = computed(() => {
  // Mock calculation - in real app, calculate based on form views vs submissions
  return 68.4
})

const avgResponseTime = computed(() => {
  // Mock calculation - in real app, calculate average form completion time
  return '2m 34s'
})

const topForms = computed(() => {
  // Mock data - in real app, sort by submission count
  return [
    { id: '1', name: 'Contact Form', submissions: 156 },
    { id: '2', name: 'Newsletter Signup', submissions: 142 },
    { id: '3', name: 'Product Inquiry', submissions: 98 },
    { id: '4', name: 'Support Request', submissions: 76 },
    { id: '5', name: 'Feedback Form', submissions: 54 }
  ]
})

const maxSubmissions = computed(() => {
  return Math.max(...topForms.value.map(f => f.submissions))
})

const recentActivity = computed(() => [
  {
    id: '1',
    icon: 'fas fa-paper-plane text-blue-500',
    text: 'New submission received for Contact Form',
    time: '2 minutes ago'
  },
  {
    id: '2',
    icon: 'fas fa-edit text-green-500',
    text: 'Newsletter Signup form was updated',
    time: '1 hour ago'
  },
  {
    id: '3',
    icon: 'fas fa-plus text-purple-500',
    text: 'New form "Event Registration" was created',
    time: '3 hours ago'
  },
  {
    id: '4',
    icon: 'fas fa-trash text-red-500',
    text: 'Old form "Survey 2023" was deleted',
    time: '1 day ago'
  }
])

const formStats = computed(() => [
  {
    id: '1',
    name: 'Contact Form',
    status: 'active',
    submissions: 156,
    conversionRate: 72.3,
    avgTime: '2m 14s',
    lastSubmission: '5 min ago'
  },
  {
    id: '2',
    name: 'Newsletter Signup',
    status: 'active',
    submissions: 142,
    conversionRate: 89.1,
    avgTime: '45s',
    lastSubmission: '12 min ago'
  },
  {
    id: '3',
    name: 'Product Inquiry',
    status: 'active',
    submissions: 98,
    conversionRate: 65.7,
    avgTime: '3m 22s',
    lastSubmission: '1 hour ago'
  },
  {
    id: '4',
    name: 'Support Request',
    status: 'inactive',
    submissions: 76,
    conversionRate: 58.2,
    avgTime: '4m 56s',
    lastSubmission: '2 days ago'
  }
])

onMounted(async () => {
  await Promise.all([
    loadSavedForms(),
    loadSubmissions()
  ])
})
</script>

<style scoped>
.analytics-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Overview Cards */
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.metric-icon.submissions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.metric-icon.forms {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.metric-icon.conversion {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.metric-icon.response {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.metric-content {
  flex: 1;
}

.metric-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.metric-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.metric-change.positive {
  color: #059669;
}

.metric-change.neutral {
  color: #6b7280;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.period-btn:hover:not(.active) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.chart-placeholder {
  height: 300px;
  position: relative;
}

.chart-visual {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 240px;
  padding: 0 1rem;
  gap: 1rem;
}

.bar {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
}

.bar:hover {
  opacity: 0.8;
  transform: translateY(-2px);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #f3f4f6;
}

.chart-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  flex: 1;
}

.chart-legend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 2px;
}

.legend-color.submissions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Stats Panels */
.stats-panels {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.form-stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-stat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-stat-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.form-stat-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.form-stat-progress {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
}

.activity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 0.875rem;
  color: #374151;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Detailed Statistics */
.detailed-stats {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.stats-table {
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 2px solid #f3f4f6;
}

.header-cell {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

.table-cell {
  display: flex;
  align-items: center;
}

.form-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0;
}

.form-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  text-transform: capitalize;
}

.form-status.active {
  background: #d1fae5;
  color: #065f46;
}

.form-status.inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.metric-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .stats-panels {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .chart-controls {
    justify-content: center;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .table-header {
    display: none;
  }
  
  .table-cell {
    justify-content: space-between;
    padding: 0.5rem 0;
  }
  
  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
}
</style>

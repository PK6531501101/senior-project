// router.js
import { createRouter, createWebHistory } from 'vue-router';

// Home
import HomeUser from '../Views/Home/Home(U).vue';
import HomeAdmin from '../Views/Home/Home(A).vue';

// Auth
import Login from '../Views/Auth/Login.vue';
import Register from '../Views/Auth/Register.vue';

// Agreement
import Terms from '../Views/Agreement/Terms.vue';
import Guidelines from '../Views/Agreement/Guide.vue';

// Tracking
import Track from '../Views/Track/Tracking.vue';

// Report
import Suggestion from '../Views/Report/SUGG/Suggestion.vue';
import Complaint from '../Views/Report/COMP/Complaint.vue';
import Corruption from '../Views/Report/CORR/Corruption.vue';

// Evaluation
import Evaluation from '../Views/Report/EVAL/Evaluation.vue';
import FormDetail from '../Views/Report/EVAL/FormDetail.vue';

// Suggestion Admin
import SuggestionList from '../Views/Submission/SUGG/SuggestionList.vue';
import SuggestionDetail from '../Views/Submission/SUGG/Detail.vue';

// Complaint Admin
import ComplaintListAdmin from '../Views/Submission/COMP/Forward/ComplaintList(A).vue';
import ComplaintDetailAdmin from '../Views/Submission/COMP/Forward/Detail(A).vue';
import ComplaintList from '../Views/Submission/COMP/ComplaintList.vue';
import ComplaintDetail from '../Views/Submission/COMP/Detail.vue';

// Corruption Admin
import CorruptionList from '../Views/Submission/CORR/CorruptionList.vue';
import CorruptionDetail from '../Views/Submission/CORR/Detail.vue';

// Evaluation Admin
import EvaluationList from '../Views/Submission/EVAL/EvaluationList.vue';
import CreateForm from '../Views/Submission/EVAL/CreateForm.vue';

// Dashboard
import Dashboard from '../Views/Dashboard/Dashboard.vue';
import DashboardAdmin from '../Views/Dashboard/Dashboard(A).vue';

const routes = [
  { path: '/', component: HomeUser },
  { path: '/home-user', component: HomeUser },
  { path: '/home-admin', component: HomeAdmin },

  { path: '/login', component: Login },
  { path: '/register', component: Register },

  { path: '/term-of-use', component: Terms },
  { path: '/guideline', component: Guidelines },

  { path: '/track', component: Track },

  { path: '/suggestion', component: Suggestion },
  { path: '/complaint', component: Complaint },
  { path: '/corruption', component: Corruption },

  { path: '/evaluation', component: Evaluation },
  { path: '/form-detail/form/:evaluationId', name: 'FormDetail', component: FormDetail },

  { path: '/suggestion-list', component: SuggestionList },
  { path: '/suggestion-detail/:id', component: SuggestionDetail },

  { path: '/complaint-list-admin', component: ComplaintListAdmin },
  { path: '/complaint-detail-admin/:id', component: ComplaintDetailAdmin },
  { path: '/complaint-list', component: ComplaintList },
  { path: '/complaint-detail/:id', component: ComplaintDetail },

  { path: '/corruption-list', component: CorruptionList },
  { path: '/corruption-detail/:id', component: CorruptionDetail },

  { path: '/evaluation-list', component: EvaluationList },
  { path: '/create-form', component: CreateForm },

  { path: '/dashboard', component: Dashboard },
  { path: '/dashboard-admin', component: DashboardAdmin },
];

export default createRouter({ history: createWebHistory(), routes });
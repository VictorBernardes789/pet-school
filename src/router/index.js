import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/pets' },
    {
      path: '/pets',
      name: 'pets',
      component: () => import('../views/PetViews.vue'),
    },
    {
      path: '/pets/novo',
      name: 'addPet',
      component: () => import('../views/AddPetView.vue'),
    },
    {
      path: '/pets/:id',
      name: 'petDetails',
      component: () => import('../views/PetDetailsView.vue'),
    },
    {
      path: '/tutores',
      name: 'tutores',
      component: () => import('../views/TutoresView.vue'),
    },
    {
      path: '/tutores/novo',
      name: 'addTutor',
      component: () => import('../views/AddTutorView.vue'),
    },
    {
      path: '/tutores/:id',
      name: 'tutorDetails',
      component: () => import('../views/TutorDetailsView.vue'),
    },
  ],
});

export default router;

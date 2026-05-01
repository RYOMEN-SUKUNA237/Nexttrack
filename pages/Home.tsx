import React from 'react';
import Layout from '../components/Layout';
import { HeroSection, TrackingCategoriesSection, CapabilitiesSection } from './HomePart1';
import { TrackSection, WhyUsSection, FAQSection } from './HomePart2';
import { TestimonialsSection, ContactSection } from './HomePart3';

const Home: React.FC = () => (
  <Layout>
    <HeroSection />
    <TrackingCategoriesSection />
    <CapabilitiesSection />
    <TrackSection />
    <WhyUsSection />
    <TestimonialsSection />
    <FAQSection />
    <ContactSection />
  </Layout>
);

export default Home;
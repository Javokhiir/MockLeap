// Create the missing about.tsx file
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const { t } = useTranslation();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
  
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: t('about.team.role1'),
      avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=person1',
      bio: t('about.team.bio1')
    },
    {
      name: 'Sarah Chen',
      role: t('about.team.role2'),
      avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=person2',
      bio: t('about.team.bio2')
    },
    {
      name: 'Michael Rodriguez',
      role: t('about.team.role3'),
      avatar: 'https://img.heroui.chat/image/avatar?w=200&h=200&u=person3',
      bio: t('about.team.bio3')
    }
  ];
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t('about.hero.title')}
            </h1>
            <p className="text-xl text-default-600 max-w-3xl mx-auto">
              {t('about.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">{t('about.mission.title')}</h2>
              <p className="text-default-600 mb-4">
                {t('about.mission.paragraph1')}
              </p>
              <p className="text-default-600">
                {t('about.mission.paragraph2')}
              </p>
            </motion.div>
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <img 
                src="https://img.heroui.chat/image/ai?w=600&h=400&u=education" 
                alt="Our Mission" 
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-default-50 dark:bg-default-900/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('about.team.title')}</h2>
            <p className="text-xl text-default-600 max-w-2xl mx-auto">
              {t('about.team.subtitle')}
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full">
                  <CardBody className="p-6 text-center">
                    <div className="mb-4 mx-auto overflow-hidden rounded-full w-24 h-24">
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-primary-600 mb-4">{member.role}</p>
                    <p className="text-default-600">{member.bio}</p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('about.faq.title')}</h2>
            <p className="text-xl text-default-600 max-w-2xl mx-auto">
              {t('about.faq.subtitle')}
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <motion.div key={num} variants={itemVariants}>
                  <Card>
                    <CardBody className="p-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {t(`about.faq.q${num}`)}
                      </h3>
                      <p className="text-default-600">
                        {t(`about.faq.a${num}`)}
                      </p>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 bg-default-50 dark:bg-default-900/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t('about.contact.title')}</h2>
            <p className="text-xl text-default-600 max-w-2xl mx-auto">
              {t('about.contact.subtitle')}
            </p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row gap-8 max-w-4xl mx-auto">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardBody className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{t('about.contact.infoTitle')}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                        <Icon icon="lucide:mail" className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm text-default-500">{t('about.contact.email')}</p>
                        <p className="font-medium">contact@realmocktest.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                        <Icon icon="lucide:phone" className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm text-default-500">{t('about.contact.phone')}</p>
                        <p className="font-medium">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                        <Icon icon="lucide:map-pin" className="text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm text-default-500">{t('about.contact.address')}</p>
                        <p className="font-medium">123 Education St, San Francisco, CA 94103</p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
            
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardBody className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{t('about.contact.socialTitle')}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <a href="#" className="flex items-center gap-3 p-3 rounded-medium hover:bg-default-100 transition-colors">
                      <Icon icon="logos:twitter" width={24} height={24} />
                      <span>Twitter</span>
                    </a>
                    
                    <a href="#" className="flex items-center gap-3 p-3 rounded-medium hover:bg-default-100 transition-colors">
                      <Icon icon="logos:facebook" width={24} height={24} />
                      <span>Facebook</span>
                    </a>
                    
                    <a href="#" className="flex items-center gap-3 p-3 rounded-medium hover:bg-default-100 transition-colors">
                      <Icon icon="logos:instagram-icon" width={24} height={24} />
                      <span>Instagram</span>
                    </a>
                    
                    <a href="#" className="flex items-center gap-3 p-3 rounded-medium hover:bg-default-100 transition-colors">
                      <Icon icon="logos:linkedin-icon" width={24} height={24} />
                      <span>LinkedIn</span>
                    </a>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
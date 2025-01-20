import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ() {
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Container
            id="faq"
            sx={{
                pt: { xs: 4, sm: 12 },
                pb: { xs: 8, sm: 16 },
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 3, sm: 6 },
                fontFamily: 'Montserrat, sans-serif',
            }}
        >
            <Typography
                component="h2"
                variant="h4"
                color="text.primary"
                sx={{
                    width: '100%',
                    textAlign: { sm: 'left', md: 'center' },
                    fontWeight: 900,
                    fontSize: '62px',
                    color: 'white',
                }}
            >
                🧐 Frequently asked questions 🧐
            </Typography>
            <Box sx={{ width: '100%' }}>
                <Accordion
                    expanded={expanded === 'panel1'}
                    onChange={handleChange('panel1')}
                    sx={{
                        color: 'white',
                        backgroundColor: 'rgba(5, 29, 64, 0.7)',
                        border: '1px solid #02F18D',
                        borderRadius: '5px',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1d-content"
                        id="panel1d-header"
                    >
                        <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                            1. What types of courses are offered on this platform?
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                            fontSize="16px"
                        >
                            Our platform offers a wide range of business-related courses, including topics such as
                            leadership, project management, marketing strategies, financial analysis, entrepreneurship,
                            and more. Whether you're a beginner or an experienced professional, we have something for
                            you.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel2'}
                    onChange={handleChange('panel2')}
                    sx={{
                        color: 'white',
                        backgroundColor: 'rgba(5, 29, 64, 0.7)',
                        border: '1px solid #02F18D',
                        borderRadius: '5px',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2d-content"
                        id="panel2d-header"
                    >
                        <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                            2. How can I access the courses?
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                        >
                            Once you sign up, you'll get immediate access to all the courses. You can watch videos,
                            download materials, and engage in interactive activities at your own pace, anytime,
                            anywhere.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel3'}
                    onChange={handleChange('panel3')}
                    sx={{
                        color: 'white',
                        backgroundColor: 'rgba(5, 29, 64, 0.7)',
                        border: '1px solid #02F18D',
                        borderRadius: '5px',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3d-content"
                        id="panel3d-header"
                    >
                        <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                            3. Are there any certifications or credentials provided?
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                        >
                            Yes! Upon successful completion of a course, you'll receive a certificate that can be added
                            to your resume or shared on LinkedIn. Some of our courses are also accredited, meaning the
                            certification can help with professional development.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel4'}
                    onChange={handleChange('panel4')}
                    sx={{
                        color: 'white',
                        backgroundColor: 'rgba(5, 29, 64, 0.7)',
                        border: '1px solid #02F18D',
                        borderRadius: '5px',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel4d-content"
                        id="panel4d-header"
                    >
                        <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                            4. Can I access the courses on mobile devices?
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                        >
                            Absolutely! Our platform is mobile-friendly, so you can access your courses on smartphones
                            and tablets. There’s also an app available for both iOS and Android devices for a seamless
                            learning experience on the go.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel5'}
                    onChange={handleChange('panel5')}
                    sx={{
                        color: 'white',
                        backgroundColor: 'rgba(5, 29, 64, 0.7)',
                        border: '1px solid #02F18D',
                        borderRadius: '5px',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel4d-content"
                        id="panel4d-header"
                    >
                        <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                            5. What if I have questions or need support during a course?
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography
                            variant="body2"
                            gutterBottom
                            sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                        >
                            We offer 24/7 customer support through live chat, email, and community forums. Additionally,
                            many courses have Q&A sections where instructors and fellow students can answer questions,
                            ensuring you always get the support you need.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Container>
    );
}

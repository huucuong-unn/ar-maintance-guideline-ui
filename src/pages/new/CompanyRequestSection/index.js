import React from 'react';
import ChatBox from '~/components/Chat/ChatBox';
import { useParams } from 'react-router-dom';

function CompanyRequestSection() {
    const { requestId } = useParams(); // Retrieve the requestId from the URL

    return (
        <div>
            <ChatBox requestId={requestId}></ChatBox>
        </div>
    );
}

export default CompanyRequestSection;

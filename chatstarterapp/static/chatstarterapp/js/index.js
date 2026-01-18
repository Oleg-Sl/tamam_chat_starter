function callMethodPromise(method, params) {
    return new Promise((resolve, reject) => {
        BX24.callMethod(
            method,
            params,
            (result) => {
                resolve(result);
            }
        );
    });
}


function callBatchPromise(cmd) {
    console.log('cmd2 = ', cmd)
    return new Promise((resolve, reject) => {
        BX24.callBatch(
            cmd,
            (result) => {
                console.log('result: ', result);
                resolve(result);
            },
            false
        );
    });
}


function renderReceiver(fields) {
    let contentHTML = '';
    for (const field of fields) {
        contentHTML += `<option value="${field.ID}">${field.VALUE}</option>`;
    }
    const selectElem = document.getElementById('receiver');
    selectElem.innerHTML = contentHTML;
}


function renderSelectField(elementId, fields) {
    let contentHTML = '';
    for (const field of fields) {
        contentHTML += `<option value="${field.ID}">${field.VALUE}</option>`;
    }
    const selectElem = document.getElementById(elementId);
    console.log('selectElem = ', selectElem);
    if (selectElem) {
        selectElem.innerHTML = contentHTML;
    }
}


async function handleChatFromDeal(dealId) {
    let cmd = {
        user: ['user.current', {}],
        fields: [`crm.deal.fields`, {}],
        deal: [
            'crm.deal.list',
            {
                filter: { ID: dealId },
                select: [
                    'ID',
                    'UF_CRM_689C03C9DF905',     // С кем нужен новый чат
                    'UF_CRM_689C03C98BB2C',     // Менеджер, создавший чат
                    'UF_CRM_69412104934C4',     // Месседжер для общения
                ]
            }
        ]
    };

    const result = await callBatchPromise(cmd);

    const user = result.user.data();
    const fields = result.fields.data();
    const deal = result.deal.data()?.[0];


    console.log('user: ', user);
    console.log('fields: ', fields?.UF_CRM_689C03C9DF905?.items);
    console.log('fields: ', fields?.UF_CRM_69412104934C4?.items);
    console.log('deal: ', deal);

    renderSelectField('receiver', fields?.UF_CRM_689C03C9DF905?.items);
    renderSelectField('messenger', fields?.UF_CRM_69412104934C4?.items);

    document.getElementById('createChatWA').addEventListener('click', async (event) => {
        const button = event.target;
        button.setAttribute('disabled', '');
        button.querySelector('span').classList.remove('d-none');

        const manager = `${user?.LAST_NAME} ${user?.NAME}`;
        const receiverId = document.getElementById('receiver').value;
        const messengerId = document.getElementById('messenger').value;
        const message = document.getElementById('message').value;
        console.log('manager: ', manager);
        console.log('receiverId: ', receiverId);
        console.log('messengerId: ', messengerId);
        console.log('message: ', message);
        const resultUpdate = await callMethodPromise(
            'crm.deal.update',
            {
                id: dealId,
                fields: {
                    UF_CRM_689C03C9DF905: receiverId,
                    UF_CRM_689C03C98BB2C: manager,
                    UF_CRM_69412104934C4: messengerId
                }
            }
        );
        console.log('resultUpdate = ', resultUpdate);

        const resultStartBizproc = await callMethodPromise(
            'bizproc.workflow.start',
            {
                TEMPLATE_ID: 2137,
                DOCUMENT_ID: [
                    'crm',
                    'CCrmDocumentDeal',
                    `DEAL_${dealId}`
                ],
                PARAMETERS: {
                    'Parameter1': message
                },
            }
        );

        console.log('resultStartBizproc = ', resultStartBizproc);

        BX24.closeApplication();
    })


}


async function handleChatFromLead(leadId) {
    // UF_CRM_1755054223541 - С кем создать чат
    // UF_CRM_1755054174474 - Менеджер создавший чат
    let cmd = {
        user: ['user.current', {}],
        fields: [`crm.lead.fields`, {}],
        lead: [
            'crm.lead.list',
            {
                filter: { ID: leadId },
                select: [
                    'ID',
                    'UF_CRM_1755054223541',     // С кем нужен новый чат
                    'UF_CRM_1755054174474',     // Менеджер, создавший чат
                    'UF_CRM_1765866255',        // Месседжер для общения
                ]
            }
        ]
    };

    const result = await callBatchPromise(cmd);
    const user = result.user.data();
    const fields = result.fields.data();
    const lead = result.lead.data()?.[0];

    console.log('user: ', user);
    console.log('fields: ', fields?.UF_CRM_1755054223541?.items);
    console.log('lead: ', lead);
    // renderReceiver(fields?.UF_CRM_1755054223541?.items);
    renderSelectField('receiver', fields?.UF_CRM_1755054223541?.items);
    renderSelectField('messenger', fields?.UF_CRM_1765866255?.items);

    document.getElementById('createChatWA').addEventListener('click', async (event) => {
        const button = event.target;
        button.setAttribute('disabled', '');
        button.querySelector('span').classList.remove('d-none');

        const manager = `${user?.LAST_NAME} ${user?.NAME}`;
        const receiverId = document.getElementById('receiver').value;
        const messengerId = document.getElementById('messenger').value;
        const message = document.getElementById('message').value;
        console.log('manager: ', manager);
        console.log('receiverId: ', receiverId);
        console.log('messengerId: ', messengerId);
        console.log('message: ', message);
        const resultUpdate = await callMethodPromise(
            'crm.lead.update',
            {
                id: leadId,
                fields: {
                    UF_CRM_1755054223541: receiverId,
                    UF_CRM_1755054174474: manager,
                    UF_CRM_1765866255: messengerId,
                }
            }
        );
        console.log('resultUpdate = ', resultUpdate);


        const resultStartBizproc = await callMethodPromise(
            'bizproc.workflow.start',
            {
                TEMPLATE_ID: 2119,
                DOCUMENT_ID: [
                    'crm',
                    'CCrmDocumentLead',
                    `LEAD_${leadId}`
                ],
                PARAMETERS: {
                    'Parameter1': message
                },
            }
        );

        console.log('resultStartBizproc = ', resultStartBizproc);

        BX24.closeApplication();
    })
}


async function handleChatFromContact(contactId) {
    const selectElem = document.getElementById('receiver');
    selectElem.parentElement.remove();

    let cmd = {
        user: ['user.current', {}],
        fields: [`crm.contact.fields`, {}],
        contact: [
            'crm.contact.list',
            {
                filter: { ID: contactId },
                select: [
                    'UF_CRM_1755055586388',         // Менеджер, создавший чат
                    'UF_CRM_694931E799E40',         // Месседжер для общения
                ]
            }
        ]
    };

    const result = await callBatchPromise(cmd);
    const user = result.user.data();
    const fields = result.fields.data();
    const contact = result.contact.data()?.[0];

    console.log('user: ', user);
    console.log('fields: ', fields);
    console.log('contact: ', contact);

    renderSelectField('messenger', fields?.UF_CRM_694931E799E40?.items);

    document.getElementById('createChatWA').addEventListener('click', async (event) => {
        const button = event.target;
        button.setAttribute('disabled', '');
        button.querySelector('span').classList.remove('d-none');

        const manager = `${user?.LAST_NAME} ${user?.NAME}`;
        const messengerId = document.getElementById('messenger').value;
        const message = document.getElementById('message').value;
        console.log('manager: ', manager);
        console.log('messengerId: ', messengerId);
        console.log('message: ', message);

        const resultUpdate = await callMethodPromise(
            'crm.contact.update',
            {
                id: contactId,
                fields: {
                    UF_CRM_1755055586388: manager,
                    UF_CRM_694931E799E40: messengerId,
                }
            }
        );
        console.log('resultUpdate = ', resultUpdate);

        const resultStartBizproc = await callMethodPromise(
            'bizproc.workflow.start',
            {
                TEMPLATE_ID: 2143,
                DOCUMENT_ID: [
                    'crm',
                    'CCrmDocumentContact',
                    `CONTACT_${contactId}`,
                ],
                PARAMETERS: {
                    'Parameter1': message
                },
            }
        );

        console.log('resultStartBizproc = ', resultStartBizproc);

        BX24.closeApplication();
    })
}


// async function handleChatFromContact(contactId) {
//     const selectElem = document.getElementById('receiver');
//     selectElem.parentElement.remove();

//     // UF_CRM_1755055586388 - Менеджер создавший чат
//     let cmd = {
//         user: ['user.current', {}],
//         contact_update: [
//             'crm.contact.update',
//             {
//                 id: contactId,
//                 fields: {
//                     UF_CRM_1755055586388: '$result[user][LAST_NAME] $result[user][NAME]',
//                 }
//             }
//         ],
//         rub_bizproc: [
//             'bizproc.workflow.start',
//             {
//                 TEMPLATE_ID: 2143,
//                 DOCUMENT_ID: [
//                     'crm',
//                     'CCrmDocumentContact',
//                     `CONTACT_${contactId}`,
//                 ]
//             }
//         ]
//     };
//     const result = callBatchPromise(cmd);
//     BX24.closeApplication();
// }


BX24.init(async function(){
    console.log('Application was loader');
    if (entityType === 'deal') {
        await handleChatFromDeal(entityId);
    } else if (entityType === 'lead') {
        await handleChatFromLead(entityId);
    } else if (entityType === 'contact') {
        await handleChatFromContact(entityId);
    }
});
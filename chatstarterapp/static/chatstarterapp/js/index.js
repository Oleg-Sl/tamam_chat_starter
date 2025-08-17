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


async function handleChatFromDeal(dealId) {
    // UF_CRM_689C03C9DF905 - С кем создать чат
    // UF_CRM_689C03C98BB2C - Менеджер создавший чат
    let cmd = {
        user: ['user.current', {}],
        fields: [`crm.deal.fields`, {}],
        deal: [
            'crm.deal.list',
            {
                filter: { ID: dealId },
                select: [
                    'ID',
                    'UF_CRM_689C03C9DF905',
                    'UF_CRM_689C03C98BB2C'
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
    console.log('deal: ', deal);
    renderReceiver(fields?.UF_CRM_689C03C9DF905?.items);

    document.getElementById('createChatWA').addEventListener('click', async (event) => {
        const button = event.target;
        button.setAttribute('disabled', '');
        button.querySelector('span').classList.remove('d-none');

        const manager = `${user?.LAST_NAME} ${user?.NAME}`;
        const receiverId = document.getElementById('receiver').value;
        const message = document.getElementById('message').value;
        console.log('manager: ', manager);
        console.log('receiverId: ', receiverId);
        console.log('message: ', message);
        const resultUpdate = await callMethodPromise(
            'crm.deal.update',
            {
                id: dealId,
                fields: {
                    UF_CRM_689C03C9DF905: receiverId,
                    UF_CRM_689C03C98BB2C: manager
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
                    'UF_CRM_1755054223541',
                    'UF_CRM_1755054174474'
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
    renderReceiver(fields?.UF_CRM_1755054223541?.items);

    document.getElementById('createChatWA').addEventListener('click', async (event) => {
        const button = event.target;
        button.setAttribute('disabled', '');
        button.querySelector('span').classList.remove('d-none');

        const manager = `${user?.LAST_NAME} ${user?.NAME}`;
        const receiverId = document.getElementById('receiver').value;
        const message = document.getElementById('message').value;
        console.log('manager: ', manager);
        console.log('receiverId: ', receiverId);
        console.log('message: ', message);
        const resultUpdate = await callMethodPromise(
            'crm.lead.update',
            {
                id: leadId,
                fields: {
                    UF_CRM_1755054223541: receiverId,
                    UF_CRM_1755054174474: manager
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

    // UF_CRM_1755055586388 - Менеджер создавший чат
    let cmd = {
        user: ['user.current', {}],
        contact_update: [
            'crm.contact.update',
            {
                id: contactId,
                fields: {
                    UF_CRM_1755055586388: '$result[user][LAST_NAME] $result[user][NAME]',
                }
            }
        ],
        rub_bizproc: [
            'bizproc.workflow.start',
            {
                TEMPLATE_ID: 2143,
                DOCUMENT_ID: [
                    'crm',
                    'CCrmDocumentContact',
                    `CONTACT_${contactId}`
                ]
            }
        ]
        // fields: [`crm.contact.fields`, {}],
        // contact: [
        //     'crm.contact.list',
        //     {
        //         filter: { ID: contactId },
        //         select: [
        //             'ID',
        //             'UF_CRM_1755055586388',
        //         ]
        //     }
        // ]
    };

    const result = callBatchPromise(cmd);
    // const resultStartBizproc = callMethodPromise(
    //     'bizproc.workflow.start',
    //     {
    //         TEMPLATE_ID: 2143,
    //         DOCUMENT_ID: [
    //             'crm',
    //             'CCrmDocumentContact',
    //             `CONTACT_${contactId}`
    //         ]
    //     }
    // );
    BX24.closeApplication();

    // const user = result.user.data();
    // const fields = result.fields.data();
    // const contact = result.contact.data()?.[0];
    // console.log('user: ', user);
    // console.log('contact: ', contact);
    // document.getElementById('createChatWA').addEventListener('click', async () => {
    //     const manager = `${user?.LAST_NAME} ${user?.NAME}`;
    //     console.log('manager: ', manager);
    //     const resultUpdate = await callMethodPromise(
    //         'crm.contact.update',
    //         {
    //             id: contactId,
    //             fields: {
    //                 UF_CRM_1755055586388: manager,
    //             }
    //         }
    //     );
    //     console.log('resultUpdate = ', resultUpdate);
    //
    //
    //     const resultStartBizproc = callMethodPromise(
    //         'bizproc.workflow.start',
    //         {
    //             TEMPLATE_ID: 2143,
    //             DOCUMENT_ID: [
    //                 'crm',
    //                 'CCrmDocumentContact',
    //                 `CONTACT_${contactId}`
    //             ]
    //         }
    //     );
    //     console.log('resultStartBizproc = ', resultStartBizproc);
    //
    //     BX24.closeApplication();
    // })
}


BX24.init(async function(){
    console.log('Application was loader');
    if (entityType === 'deal') {
        await handleChatFromDeal(entityId);
    } else if (entityType === 'lead') {
        await handleChatFromLead(entityId);
    } else if (entityType === 'contact') {
        await handleChatFromContact(entityId);
    }

    // let cmd = {
    //     user: ['user.current', {}],
    // };
    //
    // if (entityType === 'lead') {
    //     // UF_CRM_1755054223541 - С кем создать чат
    //     // UF_CRM_1755054174474 - Менеджер создавший чат
    //     cmd['lead_field'] = [`crm.lead.fields`, {}];
    //     cmd['lead'] = [
    //         'crm.lead.list',
    //         {
    //             filter: { id: entityId },
    //             select: [
    //                 'ID',
    //                 'UF_CRM_1755054223541',
    //                 'UF_CRM_1755054174474'
    //             ]
    //         }
    //     ]
    // } else if (entityType === 'deal') {
    //     handleChatFromDeal(entityId);
    //     // UF_CRM_689C03C9DF905 - С кем создать чат
    //     // UF_CRM_689C03C98BB2C - Менеджер создавший чат
    //     // cmd['deal_field'] = `crm.deal.fields`;
    //     // cmd['deal'] = [
    //     //     'crm.deal.list',
    //     //     {
    //     //         filter: { id: entityId },
    //     //         select: [
    //     //             'ID',
    //     //             'UF_CRM_689C03C9DF905',
    //     //             'UF_CRM_689C03C98BB2C'
    //     //         ]
    //     //     }
    //     // ]
    // } else if (entityType === 'contact') {
    //     // UF_CRM_1755055586388 - Менеджер создавший чат
    //     cmd['contact_field'] = [`crm.contact.fields`, {}];
    //     // cmd['contact'] = `crm.contact.get'?id=${entityId}`;
    //     cmd['contact'] = [
    //         'crm.contact.list',
    //         {
    //             filter: { id: entityId },
    //             select: [
    //                 'ID',
    //                 'UF_CRM_1755055586388'
    //             ]
    //         }
    //     ]
    // }
    // console.log('consolemd = ', cmd);
    // const result = await callBatchPromise(cmd);
    // console.log(result);

// - Добавляем кнопку - Чат WA
// - При нажатии, открывается небольшое окно с одним полем для заолнения
// - Поле называется "С кем создать чат" (тут можно сослаться на готовое поле из сущности если можно)
// - Если нет, то выбор такой: Контакт, Дизайнер
// - В поля сущностей Нужно заполнить 2 поля: Менеджер создавший чат (сюда записываем или ID или прямо ФИО (мне лучше фио)) и с кем нужен чат
// - Далее запускам БП под названием Создание чата WA (в обоих сухостях)
});
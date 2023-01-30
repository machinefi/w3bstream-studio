import { JSONSchemaFormState, JSONValue, JSONModalValue, JSONSchemaTableState } from '@/store/standard/JSONSchemaState';
import { FromSchema } from 'json-schema-to-ts';
import { definitions } from './definitions';
import { axios } from '@/lib/axios';
import { showNotification } from '@mantine/notifications';
import { eventBus } from '@/lib/event';
import { gradientButtonStyle } from '@/lib/theme';
import { PublisherType } from '@/server/routers/w3bstream';
import { PublisherTokenRender } from '@/components/JSONTableRender';
import toast from 'react-hot-toast';
import { UiSchema } from '@rjsf/utils';
import EditorWidget, { EditorWidgetUIOptions } from '@/components/EditorWidget';
import { ShowRequestTemplatesButtonWidget } from '@/components/IDE/PublishEventRequestTemplates';
import { makeObservable, observable } from 'mobx';
import { helper } from '@/lib/helper';

export const createPublisherSchema = {
    definitions: {
        projects: {
            type: 'string'
        }
    },
    type: 'object',
    properties: {
        projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
        name: { type: 'string', title: 'Name' },
        key: { type: 'string', title: 'Publisher ID' }
    },
    required: ['projectID', 'name', 'key']
} as const;

export const publishEventSchema = {
    definitions: {
        projects: {
            type: 'string'
        },
        publishers: {
            type: 'string'
        }
    },
    type: 'object',
    properties: {
        projectID: { $ref: '#/definitions/projects', title: 'Project ID' },
        publisher: { $ref: '#/definitions/publishers', title: 'Publisher' },
        payload: { type: 'string', title: 'Payload' },
        showRequestTemplates: { type: 'string', title: '' }
    },
    required: ['projectID', 'payload']
} as const;

type CreatePublisherSchemaType = FromSchema<typeof createPublisherSchema>;
type PublishEventSchemaType = FromSchema<typeof publishEventSchema>;

//@ts-ignore
createPublisherSchema.definitions = {
    projects: definitions.projects
};

//@ts-ignore
publishEventSchema.definitions = {
    projects: definitions.projects,
    publishers: definitions.publishers
};

export default class PublisherModule {
    createPublisherForm = new JSONSchemaFormState<CreatePublisherSchemaType>({
        //@ts-ignore
        schema: createPublisherSchema,
        uiSchema: {
            'ui:submitButtonOptions': {
                norender: false,
                submitText: 'Submit',
                props: {
                    w: '100%',
                    h: '32px',
                    ...gradientButtonStyle
                }
            }
        },
        afterSubmit: async (e) => {
            const { publisherID, projectName, projectID, name, key } = e.formData;
            if (publisherID && projectName) {
                await axios.request({
                    method: 'put',
                    url: `/api/w3bapp/publisher/${projectName}/${publisherID}`,
                    data: {
                        name,
                        key
                    }
                });
            } else {
                await axios.request({
                    method: 'post',
                    url: `/api/w3bapp/publisher/${projectID}`,
                    data: {
                        name,
                        key
                    }
                });
            }

            if (publisherID) {
                await showNotification({ message: 'update publisher successed' });
                eventBus.emit('publisher.update');
            } else {
                await showNotification({ message: 'create publisher successed' });
                eventBus.emit('publisher.create');
            }

            this.form.reset();
            this.modal.set({ show: false });
        },
        value: new JSONValue<CreatePublisherSchemaType>({
            default: {
                publisherID: '',
                projectName: '',
                projectID: '',
                name: '',
                key: ''
            }
        })
    });

    publishEventForm = new JSONSchemaFormState<PublishEventSchemaType, UiSchema & { payload: EditorWidgetUIOptions }>({
        //@ts-ignore
        schema: publishEventSchema,
        uiSchema: {
            'ui:submitButtonOptions': {
                norender: false,
                submitText: 'Submit',
                props: {
                    w: '100%',
                    h: '32px',
                    ...gradientButtonStyle
                }
            },
            payload: {
                'ui:widget': EditorWidget,
                'ui:options': {
                    emptyValue: `{"payload":""}`,
                    showLanguageSelector: true,
                    onChangeLanguage: (language) => {
                        console.log('language:', language);
                        if (language === 'text') {
                            this.form.value.set({
                                payload: JSON.stringify(
                                    [
                                        {
                                            "payload": "This is is an example payload1"
                                        },
                                        {
                                            "payload": "This is is an example payload2"
                                        }
                                    ],
                                    null,
                                    2
                                )
                            });
                        } else {
                            this.form.value.set({
                                payload: JSON.stringify(
                                    [
                                        {
                                            "payload": {
                                                "example": "This is is an example payload1"
                                            }
                                        },
                                        {
                                            "payload": {
                                                "example2": "This is is an example payload2"
                                            }
                                        }
                                    ],
                                    null,
                                    2
                                )
                            });
                        }
                    }
                }
            },
            showRequestTemplates: {
                'ui:widget': ShowRequestTemplatesButtonWidget
            }
        },
        afterSubmit: async (e) => {
            const { projectID } = e.formData;
            const project = globalThis.store.w3s.allProjects.value.find((item) => item.f_project_id.toString() === projectID);
            const res = await axios.request({
                method: 'post',
                url: `/api/w3bapp/event/${project.f_name}`,
                headers: {
                    'Content-Type': 'text/plain'
                },
                data: this.generateBody()
            });

            if (res.data) {
                await showNotification({ message: 'publish event successed' });
                eventBus.emit('applet.publish-event');
            }
        },
        value: new JSONValue<PublishEventSchemaType>({
            default: {
                projectID: '',
                payload: JSON.stringify(
                    [
                        {
                            "payload": {
                                "example": "This is is an example payload1"
                            }
                        },
                        {
                            "payload": {
                                "example2": "This is is an example payload2"
                            }
                        }
                    ],
                    null,
                    2
                )
            }
        })
    });
    generateBody() {
        const { publisher, payload } = this.publishEventForm.formData;
        const allPublishers = this.table.dataSource;
        const pub = allPublishers.find((item) => String(item.f_publisher_id) === publisher);
        const header = pub
            ? {
                event_type: 'ANY',
                pub_id: pub.f_key,
                token: pub.f_token,
                pub_time: Date.now()
            }
            : {
                event_type: 'ANY',
                pub_id: '',
                token: '',
                pub_time: Date.now()
            };

        try {
            const body = JSON.parse(payload);
            if (Array.isArray(body)) {
                return {
                    events: body.map((item) => ({
                        header,
                        payload: typeof item?.payload == 'string' ? helper.stringToBase64(item?.payload) : helper.stringToBase64(JSON.stringify(item?.payload))
                    }))
                };
            }

            if (body.payload) {
                return {
                    events: [
                        {
                            header,
                            payload: helper.stringToBase64(body.payload)
                        }
                    ]
                }
            }
            return {
                events: [
                    {
                        header,
                        payload: helper.stringToBase64(body)
                    }
                ]
            }
        } catch (error) {
            console.log('text', payload)
            return {
                events: [
                    {
                        header,
                        payload: helper.stringToBase64(payload)
                    }
                ]
            };
        }
    }

    form: JSONSchemaFormState<CreatePublisherSchemaType | PublishEventSchemaType> = this.createPublisherForm;

    showPublishEventRequestTemplates = false;

    modal = new JSONModalValue({
        default: {
            show: false,
            title: 'Create Publisher',
            autoReset: true
        }
    });

    table = new JSONSchemaTableState<PublisherType>({
        columns: [
            {
                key: 'f_publisher_id',
                label: 'Publisher ID'
            },
            {
                key: 'f_name',
                label: 'name'
            },
            {
                key: 'project_name',
                label: 'Project Name'
            },
            {
                key: 'f_created_at',
                label: 'created at'
            },
            {
                key: 'f_token',
                label: 'token',
                render: PublisherTokenRender
            },
            {
                key: 'actions',
                label: 'Actions',
                actions: (item) => {
                    return [
                        {
                            props: {
                                bg: '#37A169',
                                color: '#fff',
                                onClick: () => {
                                    this.form.value.set({
                                        publisherID: item.f_publisher_id,
                                        projectName: item.project_name,
                                        projectID: item.project_id,
                                        name: item.f_name,
                                        key: item.f_key
                                    });
                                    this.modal.set({ show: true, title: 'Edit Publisher' });
                                }
                            },
                            text: 'Edit'
                        },
                        {
                            props: {
                                ml: '8px',
                                bg: '#E53E3E',
                                color: '#fff',
                                onClick() {
                                    globalThis.store.base.confirm.show({
                                        title: 'Warning',
                                        description: 'Are you sure you want to delete it?',
                                        async onOk() {
                                            await axios.request({
                                                method: 'delete',
                                                url: `/api/w3bapp/publisher/${item.project_name}?publisherID=${item.f_publisher_id}`
                                            });
                                            eventBus.emit('strategy.delete');
                                            toast.success('Deleted successfully');
                                        }
                                    });
                                }
                            },
                            text: 'Delete'
                        }
                    ];
                }
            }
        ],
        rowKey: 'f_publisher_id',
        containerProps: { mt: '10px', h: 'calc(100vh - 200px)' }
    });

    constructor() {
        makeObservable(this, {
            showPublishEventRequestTemplates: observable
        });
    }
}

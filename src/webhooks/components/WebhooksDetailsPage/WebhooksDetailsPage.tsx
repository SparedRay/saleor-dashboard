import { ConfirmButtonTransitionState } from "@saleor/components/ConfirmButton";
import Container from "@saleor/components/Container";
import Form from "@saleor/components/Form";
import FormSpacer from "@saleor/components/FormSpacer";
import Grid from "@saleor/components/Grid";
import PageHeader from "@saleor/components/PageHeader";
import Savebar from "@saleor/components/Savebar";
import { WebhookErrorFragment } from "@saleor/fragments/types/WebhookErrorFragment";
import { Backlink } from "@saleor/macaw-ui";
import { getStringOrPlaceholder } from "@saleor/misc";
import {
  WebhookEventTypeAsync,
  WebhookEventTypeSync
} from "@saleor/types/globalTypes";
import WebhookEvents from "@saleor/webhooks/components/WebhookEvents";
import WebhookInfo from "@saleor/webhooks/components/WebhookInfo";
import WebhookStatus from "@saleor/webhooks/components/WebhookStatus";
import {
  createAsyncEventsSelectHandler,
  createSyncEventsSelectHandler
} from "@saleor/webhooks/handlers";
import { WebhookDetails_webhook } from "@saleor/webhooks/types/WebhookDetails";
import {
  isUnnamed,
  mapAsyncEventsToChoices,
  mapSyncEventsToChoices
} from "@saleor/webhooks/utils";
import React from "react";
import { useIntl } from "react-intl";

export interface FormData {
  syncEvents: WebhookEventTypeSync[];
  asyncEvents: WebhookEventTypeAsync[];
  isActive: boolean;
  name: string;
  secretKey: string | null;
  targetUrl: string;
}

export interface WebhooksDetailsPageProps {
  appName: string;
  disabled: boolean;
  errors: WebhookErrorFragment[];
  webhook: WebhookDetails_webhook;
  saveButtonBarState: ConfirmButtonTransitionState;
  onBack: () => void;
  onSubmit: (data: FormData) => void;
}

const WebhooksDetailsPage: React.FC<WebhooksDetailsPageProps> = ({
  appName,
  disabled,
  errors,
  webhook,
  saveButtonBarState,
  onBack,
  onSubmit
}) => {
  const intl = useIntl();

  const initialForm: FormData = {
    syncEvents: webhook?.syncEvents?.map(event => event.eventType) || [],
    asyncEvents: webhook?.asyncEvents?.map(event => event.eventType) || [],
    isActive: !!webhook?.isActive,
    name: webhook?.name || "",
    secretKey: webhook?.secretKey || "",
    targetUrl: webhook?.targetUrl || ""
  };

  return (
    <Form initial={initialForm} onSubmit={onSubmit}>
      {({ data, hasChanged, submit, change }) => {
        const syncEventsChoices = disabled
          ? []
          : mapSyncEventsToChoices(Object.values(WebhookEventTypeSync));
        const asyncEventsChoices = disabled
          ? []
          : mapAsyncEventsToChoices(
              Object.values(WebhookEventTypeAsync),
              data.asyncEvents
            );

        const handleSyncEventsSelect = createSyncEventsSelectHandler(
          change,
          data.syncEvents,
          syncEventsChoices
        );
        const handleAsyncEventsSelect = createAsyncEventsSelectHandler(
          change,
          data.asyncEvents,
          asyncEventsChoices
        );

        return (
          <Container>
            <Backlink onClick={onBack}>{appName}</Backlink>
            <PageHeader
              title={
                isUnnamed(webhook)
                  ? intl.formatMessage({
                      defaultMessage: "Unnamed Webhook Details",
                      description: "header"
                    })
                  : intl.formatMessage(
                      {
                        defaultMessage: "{webhookName} Details",
                        description: "header"
                      },
                      {
                        webhookName: getStringOrPlaceholder(webhook?.name)
                      }
                    )
              }
            />
            <Grid>
              <div>
                <WebhookInfo
                  data={data}
                  disabled={disabled}
                  errors={errors}
                  onChange={change}
                />
              </div>
              <div>
                <WebhookEvents
                  data={data}
                  syncEventsChoices={syncEventsChoices}
                  asyncEventsChoices={asyncEventsChoices}
                  onSyncEventChange={handleSyncEventsSelect}
                  onAsyncEventChange={handleAsyncEventsSelect}
                />
                <FormSpacer />
                <WebhookStatus
                  data={data.isActive}
                  disabled={disabled}
                  onChange={change}
                />
              </div>
            </Grid>
            <Savebar
              disabled={disabled || !hasChanged}
              state={saveButtonBarState}
              onCancel={onBack}
              onSubmit={submit}
            />
          </Container>
        );
      }}
    </Form>
  );
};
WebhooksDetailsPage.displayName = "WebhooksDetailsPage";
export default WebhooksDetailsPage;

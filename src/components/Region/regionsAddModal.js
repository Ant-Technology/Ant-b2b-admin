import {
  TextInput,
  Grid,
  Text,
  Stack,
  ScrollArea,
  Button,
  ActionIcon,
  LoadingOverlay,
  Group,
} from "@mantine/core";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { CREATE_REGIONS } from "apollo/mutuations";
import { GET_REGIONS } from "apollo/queries";

const RegionsAddModal = ({ setOpened, total, setTotal, activePage, setActivePage }) => {
  // mutation
  const [addRegion, { loading: regionLoading }] = useMutation(CREATE_REGIONS, {
    update(cache, { data: { createRegion } }) {
      cache.updateQuery(
        {
          query: GET_REGIONS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.regions.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              regions: {
                data: [createRegion, ...data.regions.data],
              },
            };
          }
        }
      );
    },
  });

  // form state
  const form = useForm({
    initialValues: {
      name: { en: "", am: "" },
      children: [],
    },
  });

  const { height } = useViewportSize();
  
  const handleFields = () => {
    return form.values.children.map((item, index) => (
      <Grid key={index}>
          <Grid.Col span={6}>
        <TextInput
          required
          label={`Specific Area ${index + 1}`}
          sx={{ flex: 1 }}
          {...form.getInputProps(`children.${index}.name.en`)}
        />
        </Grid.Col>
        <Grid.Col span={6}>
        <ActionIcon
          color="#ed522f"
          onClick={() => form.removeListItem("children", index)}
          style={{ marginTop: "30px", padding: "2px" }}
        >
          <Trash size={24} />
        </ActionIcon>
        </Grid.Col>
      </Grid>
    ));
  };

  const submit = () => {
    addRegion({
      variables: {
        name: form.values.name,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Region Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        setOpened(true);
        showNotification({
          color: "red",
          title: "Error",
          message: "Region Not Created Successfully",
        });
      },
    });
  };

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <LoadingOverlay visible={regionLoading} color="blue" overlayBlur={2} loader={customLoader} />
      <form onSubmit={form.onSubmit(() => submit())} noValidate>
        <Stack>
          <Grid grow>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Region Name (English)"
                placeholder="Enter region name in English"
                {...form.getInputProps("name.en")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Region Name (Amharic)"
                placeholder="Enter region name in Amharic"
                {...form.getInputProps("name.am")}
              />
            </Grid.Col>
          </Grid>
            {handleFields().length > 0 ? (
              handleFields()
            ) : (
              <Text color="dimmed" align="center">
                No specific areas added yet...
              </Text>
            )}
            <Group position="start" mt="md">
              <Button
                color="blue"
                variant="outline"
                fullWidth
                style={{
                  width: "200px", // Set a specific width for the button
                }}
                onClick={() =>
                  form.insertListItem("children", {
                    name: { en: "", am: "" },
                  })
                }
              >
                Add New Specific Area
              </Button>
            </Group>
            <Grid>
            <Grid.Col span={4}>
              <Button
                style={{
                  width: "25%",
                  marginTop: "15px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                type="submit"
                fullWidth
              >
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </ScrollArea>
  );
};

export default RegionsAddModal;
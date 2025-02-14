import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
  ActionIcon,
  Text,
  Group,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { UPDATE_REGION } from "apollo/mutuations";
import { GET_REGION } from "apollo/queries";

const RegionEditModal = ({ editId, setOpenedEdit }) => {
  const [location, setLocation] = useState({});

  const form = useForm({
    initialValues: {
      name: { en: "", am: "" },
      children: [],
    },
  });

   useEffect(() => {
      if (editId) {
        console.log(editId)
        form.setValues({
          name: {
            am: editId.name_translations.am,
            en: editId.name_translations.en,
          },
          children: JSON.parse(editId.specific_areas) || [], // Parse the specific areas
        });
      }
    }, [editId]);

  const { height } = useViewportSize();
  const [updateRegion, { loading: regionLoading }] = useMutation(UPDATE_REGION);

  const handleFields = () => {
    return form.values.children.map((item, index) => (
      <Grid key={index} gutter="md">
        <Grid.Col span={4}>
          <TextInput
            required
            label={`Specific Area ${index + 1}`}
            {...form.getInputProps(`children.${index}`)} // Bind to the string
          />
        </Grid.Col>
        <Grid.Col span={1}>
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
    updateRegion({
      variables: {
        id: editId.id,
        name: form.values.name,
        specific_areas: form.values.children, // Send specific areas as an array of strings
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Region updated Successfully",
        });
        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Region Not updated Successfully",
        });
      },
    });
  };

  return (
    <>
      <LoadingOverlay
        visible={editId === null || regionLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <ScrollArea style={{ height: height / 1.5 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Stack>
            <Grid>
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
                onClick={() => form.insertListItem("children", "")} // Insert an empty string for new specific area
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
    </>
  );
};

export default RegionEditModal;
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  CREATE_PAYMENT_TYPE,
  CREATE_USER,
  UPDATE_PAYMENT_TYPE,
} from "apollo/mutuations";
import { GET_ALL_USERS, GET_ROLES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import React, { useState, useRef, useEffect } from "react";

const PaymentTypeUpdateModal = ({ setOpened, data, editId, fetchDta }) => {
  const [files, setFiles] = useState([]);

  const fileInputRef = useRef(null);

  const [editPayment, { loading: updatePaymentLoading }] =
    useMutation(UPDATE_PAYMENT_TYPE);

  // form state
  const form = useForm({
    initialValues: {
      name: "",
    },
  });
  useEffect(() => {
    form.setValues({
      name: data.name,
    });

    // eslint-disable-next-line
  }, [data]);
  const submit = () => {
    editPayment({
      variables: {
        id: data.id,
        name: form.getInputProps("name").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Payment Type Updated Successfully",
        });
        // fetchDta();
        setOpened(false);
      },
      onError(error) {
        setOpened(true);
        let errorMessage = "Payment Type Not Updated!";
        if (error?.graphQLErrors?.length) {
          const validationErrors =
            error.graphQLErrors[0]?.extensions?.validation;
          if (validationErrors) {
            errorMessage = Object.values(validationErrors).flat().join(", ");
          }
        }
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
  };

  // handle file change
  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

  // set previews
  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <img
        key={index}
        src={imageUrl}
        alt=""
        width="130"
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  });

  const { height } = useViewportSize();
  const theme = useMantineTheme();

  return (
    <>
      <LoadingOverlay
        visible={updatePaymentLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <div>
        <ScrollArea
          style={{ height: height / 1.1 }}
          type="auto"
          offsetScrollbars
        >
          <form onSubmit={form.onSubmit(() => submit())}>
            <Stack>
              <Grid>
                <Grid.Col span={12}>
                  <TextInput
                    required
                    label="Name"
                    placeholder="Name"
                    {...form.getInputProps("name")}
                  />
                </Grid.Col>
              </Grid>

              <div style={{ marginTop: "25px" }}>
                <Button
                  onClick={() => fileInputRef.current.click()}
                  color="blue"
                  variant="outline"
                  fullWidth
                >
                  Upload Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <SimpleGrid
                  cols={4}
                  breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                  mt={previews.length > 0 ? "xl" : 0}
                >
                  {previews}
                </SimpleGrid>
              </div>
              <Grid>
                <Grid.Col span={12}>
                  <Button
                    style={{
                      marginTop: "20px",
                      width: "30%",

                      backgroundColor: "#FF6A00",
                      color: "#FFFFFF",
                    }}
                    fullWidth
                    type="submit"
                    color="blue"
                  >
                    Submit
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </form>
        </ScrollArea>
      </div>
    </>
  );
};

export default PaymentTypeUpdateModal;

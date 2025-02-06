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
import { UPDATE_PAYMENT_TYPE } from "apollo/mutuations";
import { customLoader } from "components/utilities/loader";
import React, { useState, useRef, useEffect } from "react";

const PaymentTypeUpdateModal = ({ setOpened, data, editId, fetchDta }) => {
  const [files, setFiles] = useState([]);
  const [initialProfileImage, setInitialProfileImage] = useState(null); // State for initial profile image

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
    if (data.logo) {
      setInitialProfileImage(data.logo); 
    }
  }, [data]);
  const submit = () => {
    editPayment({
      variables: {
        id:data.id,
        input: {
          //id: parseInt(data.id),
          name: form.getInputProps("name").value,
          logo: files.length > 0 ? files[files.length - 1] : null,
        },
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Payment Type Updated Successfully",
        });
        fetchDta();
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

  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
  };

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
  if (initialProfileImage && files.length === 0) {
    // Display the initial profile image if no new file is selected
    previews.unshift(
      <img key="initial" src={initialProfileImage} alt="Profile" width="130" />
    );
  }
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
                  Upload Logo
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

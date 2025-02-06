import {
  TextInput,
  Text,
  Grid,
  Button,
  Tabs,
  Group,
  ActionIcon,
  ScrollArea,
  SimpleGrid,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trash } from "tabler-icons-react";
import { useMutation } from "@apollo/client";
import React, { useState, useRef } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { tabList } from "components/utilities/tablist";
import { customLoader } from "components/utilities/loader";
import { GET_CATEGORIES } from "apollo/queries";
import { CREATE_CATEGORY } from "apollo/mutuations";

export default function CategoryAddModal({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) {
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [mainCategoryFile, setMainCategoryFile] = useState(null);
  const [subCategoryFiles, setSubCategoryFiles] = useState([]);
  const fileInputRef = useRef(null);

  const form = useForm({
    initialValues: {
      name: { en: "", am: "" },
      image: "",
      children: [],
    },
  });

  const imagePreview = (imageFile) => {
    const imageUrl = URL.createObjectURL(imageFile);
    return (
      <img
        src={imageUrl}
        width="130"
        alt=""
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  };

  const handleMainFileChange = (event) => {
    const files = Array.from(event.target.files);
    setMainCategoryFile(files[0]);
    form.setFieldValue("image", files[0]);
  };

  const handleSubCategoryFileChange = (event, index) => {
    const files = Array.from(event.target.files);
    const newSubCategoryFiles = [...subCategoryFiles];
    newSubCategoryFiles[index] = files[0];
    setSubCategoryFiles(newSubCategoryFiles);
    form.setFieldValue(`children.${index}.image`, files[0]);
  };

  const handleFields = () => {
    return form.values.children.map((item, index) => (
      <Grid key={index}>
        <Grid.Col span={4}>
          <TextInput
            placeholder="Subcategory (English)"
            required
            label={`Subcategory ${index + 1} (English)`}
            sx={{ flex: 1 }}
            {...form.getInputProps(`children.${index}.name.en`)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            placeholder="Subcategory (Amharic)"
            required
            label={`Subcategory ${index + 1} (Amharic)`}
            sx={{ flex: 1 }}
            {...form.getInputProps(`children.${index}.name.am`)}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Button
            onClick={() => fileInputRef.current.click()} // Trigger file input on button click
            variant="outline"
            color="blue"
            fullWidth
            style={{ marginTop: "25px" }}
          >
            Upload Image
          </Button>
          <input
            type="file"
            accept={IMAGE_MIME_TYPE}
            ref={fileInputRef}
            style={{ display: "none" }} // Hide the file input
            onChange={(e) => handleSubCategoryFileChange(e, index)} // Handle file selection
          />
          <SimpleGrid
            cols={4}
            breakpoints={[{ maxWidth: "sm", cols: 1 }]}
            mt={subCategoryFiles[index] ? "xl" : 0}
          >
            {subCategoryFiles[index] && imagePreview(subCategoryFiles[index])}
          </SimpleGrid>
        </Grid.Col>
        <ActionIcon
          color="#ed522f"
          onClick={() => form.removeListItem("children", index)}
          style={{ marginTop: "30px", padding: "2px" }}
        >
          <Trash size={24} />
        </ActionIcon>
      </Grid>
    ));
  };

  const [addCategory, { loading }] = useMutation(CREATE_CATEGORY, {
    update(cache, { data: { createCategory } }) {
      const { categories } = cache.readQuery({
        query: GET_CATEGORIES,
        variables: {
          first: 10,
          page: 1,
        },
      });
      if (!categories) return;

      const updatedDropoffs = [createCategory, ...categories.data];

      cache.writeQuery({
        query: GET_CATEGORIES,
        variables: {
          first: 10,
          page: 1,
        },
        data: {
          categories: {
            ...categories,
            data: updatedDropoffs,
          },
        },
      });

      const newTotal = categories.paginatorInfo.total + 1;
      setTotal(newTotal);
      setActivePage(1);
    },
  });

  const submit = () => {
    addCategory({
      variables: {
        name: form.getInputProps("name").value,
        image: mainCategoryFile,
        children: form.getInputProps("children").value.map((child, index) => ({
          ...child,
          image: subCategoryFiles[index],
        })),
      },
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Category Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        showNotification({
          color: "red",
          title: "Error",
          message: `${error}`,
        });
      },
    });
  };

  const { height } = useViewportSize();

  return (
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          <Grid>
            <Grid.Col span={4}>
              <TextInput
                required
                label="Category Name (English)"
                placeholder="Enter Category name in English"
                {...form.getInputProps("name.en")}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                required
                label="Category Name (Amharic)"
                placeholder="Enter Category name in Amharic"
                {...form.getInputProps("name.am")}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Button
                onClick={() => fileInputRef.current.click()} // Trigger file input on button click
                variant="outline"
                color="blue"
                style={{ marginTop: "25px" }}
                fullWidth
              >
                Upload Main Image
              </Button>
              <input
                type="file"
                accept={IMAGE_MIME_TYPE}
                ref={fileInputRef}
                style={{ display: "none" }} // Hide the file input
                onChange={handleMainFileChange} // Handle main image selection
              />
              {mainCategoryFile && imagePreview(mainCategoryFile)}
            </Grid.Col>
            <Grid.Col span={12}>
              {handleFields()}
              <Group position="start" mt="md">
                <Button
                  color="blue"
                  variant="outline"
                  fullWidth
                  style={{
                    width: "200px", // Set a specific width for the button
                  }}
                  onClick={() => {
                    form.insertListItem("children", { // Correct path
                      name: { en: "", am: "" },
                      image: "",
                    });
                  }}
                >
                  Add New Subcategory
                </Button>
              </Group>
            </Grid.Col>
            <Grid.Col span={4}>
              <Button
                style={{
                  width: "25%",
                  marginTop: "15px",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                type="submit"
                color="blue"
                fullWidth
              >
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </form>
      </ScrollArea>
    </Tabs>
  );
}
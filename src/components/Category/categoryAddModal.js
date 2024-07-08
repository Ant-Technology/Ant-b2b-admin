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
import { Photo, Trash } from "tabler-icons-react";
import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { tabList } from "components/utilities/tablist";
import { customLoader } from "components/utilities/loader";
import { CREATE_CATEGORY } from "apollo/mutuations";
import { GET_CATEGORIES } from "apollo/queries";

export default function CategoryAddModal({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) {
  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [file, setFile] = useState([]);

  const imagePreview = () => {
    const imageUrl = URL.createObjectURL(file[0]);
    return (
      <img
        src={imageUrl}
        width="130"
        alt=""
        imageprops={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  };

  //form initialization and validation
  const form = useForm({
    initialValues: {
      name: { en: "", am: "" },
      image: "",
      children: [],
    },
  });

  const handleFields = (value) => {
    let fields = form.values.children.map((item, index) => {
      return (
        <Group key={item.key} mt="xs">
          <TextInput
            placeholder="Subcategory"
            required
            label={`child Category ${index + 1}`}
            sx={{ flex: 1 }}
            {...form.getInputProps(
              value === "am"
                ? `children.${index}.name.am`
                : `children.${index}.name.en`
            )}
          />
          <ActionIcon
            color="#ed522f"
            onClick={() => form.removeListItem("children", index)}
            style={{ marginTop: "30px", padding: "2px" }}
          >
            <Trash size={24} />
          </ActionIcon>
        </Group>
      );
    });

    return fields;
  };

  const [addCategory, { loading }] = useMutation(CREATE_CATEGORY, {
    update(cache, { data: { createCategory } }) {
      // Read the existing data from the cache
      const { categories } = cache.readQuery({
        query: GET_CATEGORIES,
        variables: {
          first: 10,
          page: 1,
        },
      });
      if (!categories) {
        return;
      }
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
    if (activeTab === tabList[tabList.length - 1].value) {
      addCategory({
        variables: {
          name: form.getInputProps("name").value,
          image: form.getInputProps("image").value,
          children: form.getInputProps("children").value,
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
    } else {
      setActiveTab(tabList[tabList.length - 1].value);
    }
  };

  const { height } = useViewportSize();

  // attach uploaded image to ueform image value
  const handleImageUpload = (image) => {
    setFile(image);
    form.setFieldValue("image", image[0]);
  };

  return (
    //mapping the header icon and title
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <Tabs.List>
        {tabList.map((tab, i) => {
          return (
            <Tabs.Tab key={i} value={tab.value} icon={<Photo size={14} />}>
              {tab.name}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())} noValidate>
          {/* mapping the tablist */}
          {tabList.map((tab, i) => {
            return (
              <Tabs.Panel key={i} value={tab.value} pt="xs">
                <Grid grow>
                  <Grid.Col span={6}>
                    <Grid.Col span={4}>
                      <TextInput
                        required
                        label={tab.label}
                        placeholder={tab.placeHolder}
                        {...form.getInputProps("name." + tab.shortHand)}
                      />
                      <ScrollArea style={{ height: 300 }}>
                        <div style={{ marginTop: "25px" }}>
                          <Dropzone
                            accept={IMAGE_MIME_TYPE}
                            onDrop={handleImageUpload}
                          >
                            <Group
                              position="center"
                              spacing="xl"
                              style={{ minHeight: 200, pointerEvents: "none" }}
                            >
                              <div>
                                <Text size="xl" inline>
                                  Drag image here or click to select file
                                </Text>
                                <Text size="sm" color="dimmed" inline>
                                  Attach one image for the category
                                </Text>
                              </div>
                            </Group>
                          </Dropzone>

                          <SimpleGrid
                            cols={4}
                            breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                            mt={"xl"}
                          >
                            {/* TODO: center the preview */}
                            <Grid>
                              <Grid.Col span={4}></Grid.Col>
                              <Grid.Col span={4}>
                                {file.length > 0 && imagePreview()}
                              </Grid.Col>
                              <Grid.Col span={4}></Grid.Col>
                            </Grid>
                          </SimpleGrid>
                        </div>
                      </ScrollArea>
                    </Grid.Col>

                    <Grid.Col span={4}>
                      <Button
                        style={{ display: activeTab === 1 ? "none" : "" }}
                        type="submit"
                        color="blue"
                        variant="outline"
                        fullWidth
                      >
                        Submit
                      </Button>
                    </Grid.Col>
                  </Grid.Col>

                  <Grid.Col span={6}>
                    <ScrollArea
                      style={{ height: height / 1.8 }}
                      type="auto"
                      offsetScrollbars
                    >
                      {handleFields(tab.shortHand).length > 0 ? (
                        <Group mb="xs"></Group>
                      ) : (
                        <Text color="dimmed" align="center">
                          No sub category Added Yet...
                        </Text>
                      )}

                      {handleFields(tab.shortHand)}

                      <Group position="center" mt="md">
                        <Button
                          color="blue"
                          variant="outline"
                          fullWidth
                          onClick={() =>
                            form.insertListItem("children", {
                              name: { en: "", am: "" },
                            })
                          }
                        >
                          Add new sub category
                        </Button>
                      </Group>
                    </ScrollArea>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
            );
          })}
        </form>
      </ScrollArea>
    </Tabs>
  );
}

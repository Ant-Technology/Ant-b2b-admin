import {
  Tabs,
  TextInput,
  Textarea,
  Grid,
  Stack,
  Card,
  Button,
  Checkbox,
  ScrollArea,
  LoadingOverlay,
  Group,
  Text,
  ActionIcon,
  SimpleGrid,
  useMantineTheme,
  Select,
} from "@mantine/core";
import {  useState } from "react";
import { useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import {
  Photo,
  Plus,
  Trash,
  Ban,
  Upload,
  PictureInPicture,
} from "tabler-icons-react";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useQuery } from "@apollo/client";
import { customLoader } from "components/utilities/loader";
import { tabList } from "components/utilities/tablist";
import { UPDATE_PRODUCT } from "apollo/mutuations";
import {  GET_PRODUCT, NON_PAGINATED_CATEGORIES } from "apollo/queries";

const ProductEditModal = ({
  editId,
  openedEdit,
  setOpenedEdit,
}) => {
  const theme = useMantineTheme();
  const [updateProduct, {loading: updateProductLoading }] =
    useMutation(UPDATE_PRODUCT);
  const { height } = useViewportSize();
  const [dropDownData, setDropDownData] = useState({ enArr: [], amArr: [] });

  const form = useForm({});

  // useEffect(() => {
  //   if (editId) {
  //     getProduct({
  //      });
  //   }
  // }, []);

  const {loading } =  useQuery(GET_PRODUCT, {
    variables: { id: editId },
    onCompleted(data) {
      const forUpdate = [];
      // map over product.attributes tp structure the data as required
      data.product.attributes.forEach((item, i) => {
        let attributeValues = [];
        // map over item.values to structure the data as required
        item?.values?.forEach((value, i) => {
          attributeValues.push({
            id: value.id,
            value: value.value_translations,
          });
        });
        // push the structured data to the new array
        forUpdate.push({
          id: item.id,
          name: item.name_translations,
          values: { create: [], update: attributeValues, delete: [] },
        });
      });


      form.setValues({
        name: {
          am: data.product.name_translations.am,
          en: data.product.name_translations.en,
        },
        short_description: {
          am: data.product.short_description_translations.am,
          en: data.product.short_description_translations.en,
        },
        description: {
          am: data.product.description_translations.am,
          en: data.product.description_translations.en,
        },
        category: { connect: data.product.category.id },
        images: { delete: [], existing: data.product.images, create: [] },
        is_active: data.product.is_active,
        attributes: {
          update: [...forUpdate],
          create: [],
          delete: [],
        },
      });
    },
 
  })

  const { loading: categoryLoading } = useQuery(NON_PAGINATED_CATEGORIES, {
    onCompleted(data) {
    const enArr = [];
    data.categoryNonPaginated.forEach((item, index) => {
      enArr.push({ label: item.name_translations.en, value: item.id });
    });

    const amArr = [];
    data.categoryNonPaginated.forEach((item, index) => {
      amArr.push({ label: item.name_translations.am, value: item.id });
    });

    setDropDownData({ enArr, amArr });
  },
});

  const handleAttributeCards = (value) => {
    const attributeCards = form.values.attributes?.update.map((item, index) => (
      <Card key={index} shadow="sm" p="lg" radius="md" withBorder mt="xl">
        <Stack>
          <Group position="right">
            <ActionIcon
              color="red"
              onClick={() => {
                form.removeListItem("attributes.update", index);
                form.insertListItem("attributes.delete", parseInt(item.id));
              }}
            >
              <Ban size={26} strokeWidth={2} color="red" />
            </ActionIcon>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Name"
                placeholder="Attirbute Name"
                {...form.getInputProps(
                  value === "am"
                    ? `attributes.update.${index}.name.am`
                    : `attributes.update.${index}.name.en`
                )}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Group mt="xl" position="right">
                <Button
                  onClick={() =>
                    form.insertListItem(
                      `attributes.update.${index}.values.create`,
                      {
                        value: { en: "", am: "" },
                      }
                    )
                  }
                  fullWidth
                  variant="outline"
                  leftIcon={<Plus />}
                  color="blue"
                >
                  Add value
                </Button>
              </Group>
              {form.values.attributes.update[index].values.update.length > 0
                ? form.values.attributes.update[index].values.update.map(
                    (attr, idx) => (
                      <Group key={idx} mt="xs">
                        <TextInput
                          placeholder="Attribute Value"
                          required
                          sx={{ flex: 1 }}
                          {...form.getInputProps(
                            value === "am"
                              ? `attributes.update.${index}.values.update.${idx}.value.am`
                              : `attributes.update.${index}.values.update.${idx}.value.en`
                          )}
                        />

                        <ActionIcon
                          color="#ed522f"
                          onClick={() => {
                            form.removeListItem(
                              `attributes.update.${index}.values.update`,
                              idx
                            );
                            form.insertListItem(
                              `attributes.update.${index}.values.delete`,
                              attr.id
                            );
                          }}
                        >
                          <Trash  size={24} />
                        </ActionIcon>
                      </Group>
                    )
                  )
                : form.values.attributes.update[index].values.create.length ===
                    0 &&
                  form.values.attributes.update[index].values.update.length ===
                    0 && <p>no added attr</p>}

              {form.values.attributes.update[index].values.create.length > 0
                ? form.values.attributes.update[index].values.create.map(
                    (attr, idx) => (
                      <Group key={idx} mt="xs">
                        <TextInput
                          placeholder="Attribute Value"
                          required
                          sx={{ flex: 1 }}
                          {...form.getInputProps(
                            value === "am"
                              ? `attributes.update.${index}.values.create.${idx}.value.am`
                              : `attributes.update.${index}.values.create.${idx}.value.en`
                          )}
                        />

                        <ActionIcon
                          color="#ed522f"
                          onClick={() =>
                            form.removeListItem(
                              `attributes.update.${index}.values.create`,
                              idx
                            )
                          }
                        >
                          <Trash  size={24} />
                        </ActionIcon>
                      </Group>
                    )
                  )
                : null}
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    ));

    return attributeCards;
  };

  const handleNewAttributeCards = (value) => {
    const attributeCards = form.values.attributes?.create.map((item, index) => (
      <Card key={index} shadow="sm" p="lg" radius="md" withBorder mt="xl">
        <Stack>
          <Group position="right">
            <ActionIcon
              color="red"
              onClick={() => {
                form.removeListItem("attributes.create", index);
              }}
            >
              <Ban size={26} strokeWidth={2} color="red" />
            </ActionIcon>
          </Group>

          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                label="Name"
                placeholder="Attirbute Name"
                {...form.getInputProps(
                  value === "am"
                    ? `attributes.create.${index}.name.am`
                    : `attributes.create.${index}.name.en`
                )}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Group mt="xl" position="right">
                <Button
                  onClick={() =>
                    form.insertListItem(
                      `attributes.create.${index}.values.create`,
                      { value: { en: "", am: "" } }
                    )
                  }
                  fullWidth
                  variant="outline"
                  leftIcon={<Plus />}
                  color="blue"
                >
                  Add value
                </Button>
              </Group>
              {form.values.attributes.create[index].values.create.length > 0 ? (
                form.values.attributes.create[index].values.create.map(
                  (attr, idx) => (
                    <Group key={idx} mt="xs">
                      <TextInput
                        placeholder="Attribute Value"
                        required
                        sx={{ flex: 1 }}
                        {...form.getInputProps(
                          value === "am"
                            ? `attributes.create.${index}.values.create.${idx}.value.am`
                            : `attributes.create.${index}.values.create.${idx}.value.en`
                        )}
                      />

                      <ActionIcon
                        color="#ed522f"
                        onClick={() =>
                          form.removeListItem(
                            `attributes.create.${index}.values.create`,
                            idx
                          )
                        }
                      >
                        <Trash  size={24} />
                      </ActionIcon>
                    </Group>
                  )
                )
              ) : (
                <p>no added attr</p>
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>
    ));

    return attributeCards;
  };


  const submit = () => {
    form.getInputProps("attributes").value.update.forEach((obj) => {
      delete obj.name.__typename;
      obj.values.update.forEach((inrenalobject)=> {
        delete inrenalobject.value.__typename

      })

    });
    // return;
    if (activeTab === tabList[tabList.length - 1].value) {
      updateProduct({
        variables: {
          id: editId,
          name: form.getInputProps("name").value,
          short_description: form.getInputProps("short_description").value,
          description: form.getInputProps("description").value,
          is_active: form.getInputProps("is_active").value,
          attributes: form.getInputProps("attributes").value,
          images: {
            create: [...files],
            delete: [...form.getInputProps("images.delete").value],
          },
          category: form.getInputProps("category").value,
        },
        onCompleted(data) {
          showNotification({
            color: "green",
            title: "Success",
            message: "Product updated Successfully",
          });

          setOpenedEdit(false);
        },
        onError(error) {
          setOpenedEdit(false);
          showNotification({
            color: "red",
            title: "Error",
            message: "Product Not updated Successfully",
          });
        },
      });
    } else {
      setActiveTab(tabList[tabList.length - 1].value);
    }
  };

  // to control the current active tab
  const [activeTab, setActiveTab] = useState(tabList[0].value);
  const [files, setFiles] = useState([]);

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <div style={{ position: "relative" }} key={index}>
        <Trash
          onClick={() => {
            //removes from preview and create object
            form.removeListItem("images.create", index);
            files.splice(index, 1);
            setFiles(files);
          }}
          color="#ed522f"
          style={{
            borderRadius: 50,
            backgroundColor: "black",
            position: "absolute",
            top: -2,
            left: 0,
            padding: 2,
          }}
        />
        <img
          style={{ display: "block" }}
          key={index}
          src={imageUrl}
          width="130"
          alt=""
          imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
        />
      </div>
    );
  });

  const setDropDownValue = (val) => {
    form.setFieldValue("category.connect", val);
  };

  return (
    <Tabs color="blue" value={activeTab} onTabChange={setActiveTab}>
      <LoadingOverlay
        visible={loading || updateProductLoading || categoryLoading}
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
        <form onSubmit={form.onSubmit(() => submit())}>
          {tabList.map((tab, i) => {
            return (
              <Tabs.Panel key={i} value={tab.value} pt="xs">
                <Stack>
                  <Grid>
                    <Grid.Col span={6}>
                      <TextInput
                        required
                        label="Name"
                        placeholder="Product Name"
                        {...form.getInputProps("name." + tab.shortHand)}
                      />
                      <Textarea
                        placeholder="Short Description"
                        label="Short Description"
                        required
                        {...form.getInputProps(
                          "short_description." + tab.shortHand
                        )}
                      />
                      <Textarea
                        placeholder="Description"
                        label="Description"
                        required
                        {...form.getInputProps("description." + tab.shortHand)}
                      />
                      <Group position="left">
                        <div style={{ marginTop: "10px" }}>
                          <Checkbox
                            color="blue"
                            size="lg"
                            checked={form.values.is_active}
                            label="Is active"
                            onChange={(event) => {
                              form.setFieldValue(
                                "is_active",
                                event.currentTarget.checked
                              );
                            }}
                          />
                        </div>
                      </Group>
                      <Select
                        data={
                          tab.shortHand === "en"
                            ? dropDownData.enArr
                            : dropDownData.amArr
                        }
                        value={form
                          .getInputProps("category.connect")
                          .value?.toString()}
                        onChange={setDropDownValue}
                        label="Category"
                        placeholder="Pick a category this product belongs to"
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <ScrollArea style={{ height: 300 }}>
                        <div style={{ marginTop: "25px" }}>
                          <Dropzone
                            accept={IMAGE_MIME_TYPE}
                            onDrop={(val) => {
                              setFiles(val);
                              form.insertListItem("images.create", val);
                            }}
                          >
                            <Group
                              position="center"
                              spacing="xl"
                              style={{ minHeight: 200, pointerEvents: "none" }}
                            >
                              <Dropzone.Accept>
                                <Upload
                                  size={50}
                                  stroke={1.5}
                                  color={
                                    theme.colors[theme.primaryColor][
                                      theme.colorScheme === "dark" ? 4 : 6
                                    ]
                                  }
                                />
                              </Dropzone.Accept>
                              <Dropzone.Reject>
                                <PictureInPicture
                                  size={50}
                                  stroke={1.5}
                                  color={
                                    theme.colors.red[
                                      theme.colorScheme === "dark" ? 4 : 6
                                    ]
                                  }
                                />
                              </Dropzone.Reject>
                              <Dropzone.Idle>
                                <PictureInPicture size={50} stroke={1.5} />
                              </Dropzone.Idle>

                              <div>
                                <Text size="xl" inline>
                                  Drag images here or click to select files
                                </Text>
                                <Text size="sm" color="dimmed" inline mt={7}>
                                  Attach as many files as you like, each file
                                  should not exceed 5mb
                                </Text>
                              </div>
                            </Group>
                          </Dropzone>

                          <SimpleGrid
                            cols={4}
                            breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                            mt={
                              form.values.images?.existing.length > 0 ? "xl" : 0
                            }
                          >
                            {previews}
                            {form.values.images?.existing.map((item, i) => {
                              return (
                                <div style={{ position: "relative" }} key={i}>
                                  <Trash
                                    onClick={() => {
                                      form.insertListItem(
                                        "images.delete",
                                        parseInt(item.id)
                                      );
                                      form.removeListItem("images.existing", i);
                                    }}
                                    color="#ed522f"
                                    style={{
                                      borderRadius: 50,
                                      backgroundColor: "black",
                                      position: "absolute",
                                      top: -2,
                                      left: 0,
                                      padding: 2,
                                    }}
                                  />
                                  <img
                                    style={{ display: "block" }}
                                    src={item.original_url}
                                    alt=""
                                    width="130"
                                  />
                                </div>
                              );
                            })}
                          </SimpleGrid>
                        </div>
                      </ScrollArea>
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={12}>
                      {" "}
                      <Group position="apart">
                        <Text weight={500}>Attributes</Text>
                        <Button
                          variant="blue"
                          color="blue"
                          leftIcon={<Plus size={14} />}
                          onClick={() => {
                            form.insertListItem("attributes.create", {
                              name: { en: "", am: "" },
                              values: {
                                create: [{ value: { en: "", am: "" } }],
                              },
                            });
                          }}
                        >
                          Adding an Attribute
                        </Button>
                      </Group>
                      {handleAttributeCards(tab.shortHand)}
                      {handleNewAttributeCards(tab.shortHand)}
                    </Grid.Col>
                  </Grid>
                  <Grid>
                    <Grid.Col span={4}>
                      <Button
                        style={{ display: activeTab === 1 ? "none" : "" }}
                        type="submit"
                        color="blue"
                        variant="outline"
                        fullWidth
                        onClick={(e) => submit()}
                      >
                        Submit
                      </Button>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Tabs.Panel>
            );
          })}
        </form>
      </ScrollArea>
    </Tabs>
  );
};

export default ProductEditModal;

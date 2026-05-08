
import pytest


# tests/test_rbac.py
@pytest.mark.asyncio
async def test_member_cannot_delete_others_task(client, user_factory, org_factory, task_factory):
    # Arrange
    org = await org_factory.create()
    alice = await user_factory.create_member(org)     # member role
    bob = await user_factory.create_member(org)
    bobs_task = await task_factory.create(org=org, created_by=bob)

    # Act — Alice tries to delete Bob's task
    response = await client.delete(
        f"/tasks/{bobs_task.task_id}",
        headers=await alice.auth_headers(client)
    )

    # Assert
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_admin_can_delete_any_task(client, user_factory, org_factory, task_factory):
    org = await org_factory.create()
    admin = await user_factory.create_admin(org)
    member = await user_factory.create_member(org)
    members_task = await task_factory.create(org=org, created_by=member)

    response = await client.delete(
        f"/tasks/{members_task.task_id}",
        headers=await admin.auth_headers(client)
    )
    assert response.status_code == 204

@pytest.mark.asyncio
async def test_cross_tenant_isolation(client, user_factory, org_factory, task_factory):
    """User from org A must NEVER see org B's tasks."""
    org_a = await org_factory.create()
    org_b = await org_factory.create()
    alice = await user_factory.create_member(org_a)
    org_b_task = await task_factory.create(org=org_b)

    response = await client.get(
        f"/tasks/{org_b_task.task_id}",
        headers=await alice.auth_headers(client)
    )
    # Should be 404 (not even acknowledge it exists), not 403
    assert response.status_code == 404
